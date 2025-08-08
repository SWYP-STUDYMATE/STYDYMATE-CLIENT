import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', cors());

// 이미지 업로드 엔드포인트
app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string || 'profile'; // profile, chat, etc.

    if (!file || !userId) {
      return c.json({ error: 'Image file and userId are required' }, 400);
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' }, 400);
    }

    // 파일 크기 검증 (최대 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ error: 'File size exceeds 10MB limit' }, 400);
    }

    // 고유 파일명 생성
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}/${userId}/${timestamp}.${fileExt}`;

    // R2에 원본 이미지 저장
    const arrayBuffer = await file.arrayBuffer();
    await c.env.STORAGE.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId,
        type,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    // 이미지 변형 URL 생성
    const baseUrl = `https://${c.req.header('host')}`;
    const variants = {
      original: `${baseUrl}/api/images/serve/${fileName}`,
      thumbnail: `${baseUrl}/api/images/transform/${fileName}?width=150&height=150&fit=cover`,
      medium: `${baseUrl}/api/images/transform/${fileName}?width=400&height=400&fit=contain`,
      large: `${baseUrl}/api/images/transform/${fileName}?width=800&height=800&fit=contain`
    };

    // 메타데이터 캐싱
    await c.env.CACHE.put(
      `image:${fileName}`,
      JSON.stringify({
        fileName,
        userId,
        type,
        originalName: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        variants
      }),
      { expirationTtl: 86400 * 30 } // 30일 캐시
    );

    return c.json({
      success: true,
      fileName,
      variants,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('Image upload error:', error);
    return c.json({ error: error.message || 'Failed to upload image' }, 500);
  }
});

// 이미지 변환 엔드포인트
app.get('/transform/*', async (c) => {
  try {
    const path = c.req.param('*');
    if (!path) {
      return c.json({ error: 'Image path is required' }, 400);
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(c.req.url);
    const width = parseInt(searchParams.get('width') || '0');
    const height = parseInt(searchParams.get('height') || '0');
    const quality = parseInt(searchParams.get('quality') || '85');
    const fit = searchParams.get('fit') || 'contain'; // contain, cover, fill, inside, outside
    const format = searchParams.get('format') || 'auto'; // auto, webp, avif, jpeg, png

    // R2에서 원본 이미지 가져오기
    const object = await c.env.STORAGE.get(path);
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }

    // 캐시 키 생성
    const cacheKey = `transformed:${path}:w${width}:h${height}:q${quality}:${fit}:${format}`;
    
    // 캐시 확인
    const cached = await c.env.CACHE.get(cacheKey, { type: 'arrayBuffer' });
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': format === 'auto' ? 'image/webp' : `image/${format}`,
          'Cache-Control': 'public, max-age=31536000',
          'X-Cache': 'HIT'
        }
      });
    }

    // 이미지 변환 (Workers에서는 직접 변환 불가, URL 변환 사용)
    // 실제로는 Cloudflare Images API를 사용하거나 Images 바인딩 사용
    const imageBuffer = await object.arrayBuffer();

    // 간단한 응답 (실제로는 변환된 이미지)
    // TODO: Images 바인딩으로 실제 변환 구현
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'X-Cache': 'MISS'
      }
    });

  } catch (error: any) {
    console.error('Image transform error:', error);
    return c.json({ error: error.message || 'Failed to transform image' }, 500);
  }
});

// 원본 이미지 제공 엔드포인트
app.get('/serve/*', async (c) => {
  try {
    const path = c.req.param('*');
    if (!path) {
      return c.json({ error: 'Image path is required' }, 400);
    }

    // R2에서 이미지 가져오기
    const object = await c.env.STORAGE.get(path);
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    
    // 보안을 위한 Content-Security-Policy 추가
    headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self';");
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, { headers });

  } catch (error: any) {
    console.error('Image serve error:', error);
    return c.json({ error: error.message || 'Failed to serve image' }, 500);
  }
});

// 이미지 삭제 엔드포인트
app.delete('/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName');
    const userId = c.req.header('x-user-id');

    if (!fileName || !userId) {
      return c.json({ error: 'fileName and userId are required' }, 400);
    }

    // 메타데이터 확인으로 소유권 검증
    const metadata = await c.env.CACHE.get(`image:${fileName}`, { type: 'json' });
    if (!metadata || metadata.userId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // R2에서 삭제
    await c.env.STORAGE.delete(fileName);

    // 캐시에서 메타데이터 삭제
    await c.env.CACHE.delete(`image:${fileName}`);

    return c.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error: any) {
    console.error('Image delete error:', error);
    return c.json({ error: error.message || 'Failed to delete image' }, 500);
  }
});

// 사용자 이미지 목록 조회
app.get('/list/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const type = c.req.query('type'); // optional filter by type

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    // R2에서 사용자 이미지 목록 조회
    const prefix = type ? `${type}/${userId}/` : userId;
    const list = await c.env.STORAGE.list({ prefix, limit: 1000 });

    const images = await Promise.all(
      list.objects.map(async (obj) => {
        // 캐시에서 메타데이터 조회
        const metadata = await c.env.CACHE.get(`image:${obj.key}`, { type: 'json' });
        
        return {
          key: obj.key,
          size: obj.size,
          uploadedAt: obj.uploaded.toISOString(),
          metadata: metadata || {
            fileName: obj.key,
            contentType: obj.httpMetadata?.contentType
          }
        };
      })
    );

    return c.json({
      success: true,
      images,
      count: images.length
    });

  } catch (error: any) {
    console.error('Image list error:', error);
    return c.json({ error: error.message || 'Failed to list images' }, 500);
  }
});

// 이미지 메타데이터 조회
app.get('/info/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName');

    if (!fileName) {
      return c.json({ error: 'fileName is required' }, 400);
    }

    // 캐시에서 메타데이터 조회
    const metadata = await c.env.CACHE.get(`image:${fileName}`, { type: 'json' });
    if (!metadata) {
      // R2에서 직접 조회
      const object = await c.env.STORAGE.head(fileName);
      if (!object) {
        return c.json({ error: 'Image not found' }, 404);
      }

      return c.json({
        fileName,
        size: object.size,
        uploadedAt: object.uploaded.toISOString(),
        contentType: object.httpMetadata?.contentType,
        customMetadata: object.customMetadata
      });
    }

    return c.json(metadata);

  } catch (error: any) {
    console.error('Image info error:', error);
    return c.json({ error: error.message || 'Failed to get image info' }, 500);
  }
});

export default app;