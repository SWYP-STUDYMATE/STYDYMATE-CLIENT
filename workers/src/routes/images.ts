import { Hono } from 'hono';
import { Env } from '../index';
import {
    uploadImage,
    createDirectUploadURL,
    getImageURL,
    generateSignedURL,
    deleteImage,
    listImages,
    getImageDetails,
    createVariant,
    DEFAULT_VARIANTS
} from '../services/images';

export const imagesRoutes = new Hono<{ Bindings: Env }>();

// 이미지 업로드
imagesRoutes.post('/upload', async (c) => {
    try {
        const contentType = c.req.header('content-type') || '';
        
        let imageData: ArrayBuffer | string;
        let metadata: Record<string, any> = {};
        let filename = 'image.png';
        let requireSignedURLs = false;

        if (contentType.includes('multipart/form-data')) {
            // 폼 데이터로 업로드
            const formData = await c.req.formData();
            const file = formData.get('image') as File;
            
            if (!file) {
                return c.json({ error: 'No image file provided' }, 400);
            }

            imageData = await file.arrayBuffer();
            filename = file.name;
            
            // 메타데이터 파싱
            const metadataStr = formData.get('metadata') as string;
            if (metadataStr) {
                try {
                    metadata = JSON.parse(metadataStr);
                } catch (e) {
                    // 메타데이터 파싱 실패 시 무시
                }
            }

            const requireSigned = formData.get('requireSignedURLs');
            requireSignedURLs = requireSigned === 'true';
        } else {
            // JSON으로 업로드 (Base64)
            const body = await c.req.json();
            
            if (!body.image) {
                return c.json({ error: 'No image data provided' }, 400);
            }

            imageData = body.image;
            metadata = body.metadata || {};
            filename = body.filename || filename;
            requireSignedURLs = body.requireSignedURLs || false;
        }

        // 사용자 ID를 메타데이터에 추가
        const userId = c.req.header('x-user-id');
        if (userId) {
            metadata.userId = userId;
        }

        const result = await uploadImage(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            imageData,
            {
                filename,
                metadata,
                requireSignedURLs
            }
        );

        // 기본 변형 URL들 생성
        const variants: Record<string, string> = {};
        for (const variant of result.variants) {
            variants[variant] = getImageURL(c.env.CF_ACCOUNT_HASH, result.id, variant);
        }

        return c.json({
            success: true,
            id: result.id,
            variants,
            requireSignedURLs: result.requireSignedURLs,
            metadata: result.metadata
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return c.json({ 
            error: 'Failed to upload image',
            message: error.message 
        }, 500);
    }
});

// 직접 업로드 URL 생성
imagesRoutes.post('/direct-upload', async (c) => {
    try {
        const body = await c.req.json();
        
        const result = await createDirectUploadURL(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            {
                expiry: body.expiry ? new Date(body.expiry) : undefined,
                metadata: body.metadata,
                requireSignedURLs: body.requireSignedURLs
            }
        );

        return c.json({
            success: true,
            id: result.id,
            uploadURL: result.uploadURL
        });
    } catch (error) {
        console.error('Direct upload URL error:', error);
        return c.json({ 
            error: 'Failed to create direct upload URL',
            message: error.message 
        }, 500);
    }
});

// 이미지 목록 조회
imagesRoutes.get('/list', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const perPage = parseInt(c.req.query('per_page') || '20');

        const result = await listImages(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            { page, perPage }
        );

        // 각 이미지에 대한 URL 추가
        const imagesWithUrls = result.images.map(img => ({
            ...img,
            urls: {
                public: getImageURL(c.env.CF_ACCOUNT_HASH, img.id, 'public'),
                thumbnail: getImageURL(c.env.CF_ACCOUNT_HASH, img.id, 'thumbnail')
            }
        }));

        return c.json({
            success: true,
            images: imagesWithUrls,
            pagination: {
                total: result.total,
                page: result.page,
                perPage: result.perPage,
                totalPages: Math.ceil(result.total / result.perPage)
            }
        });
    } catch (error) {
        console.error('Image list error:', error);
        return c.json({ 
            error: 'Failed to list images',
            message: error.message 
        }, 500);
    }
});

// 이미지 상세 정보
imagesRoutes.get('/:imageId', async (c) => {
    try {
        const imageId = c.req.param('imageId');
        
        const result = await getImageDetails(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            imageId
        );

        // 변형 URL들 추가
        const variants: Record<string, string> = {};
        for (const variant of result.variants) {
            variants[variant] = getImageURL(c.env.CF_ACCOUNT_HASH, result.id, variant);
        }

        return c.json({
            success: true,
            ...result,
            urls: variants
        });
    } catch (error) {
        console.error('Image details error:', error);
        return c.json({ 
            error: 'Failed to get image details',
            message: error.message 
        }, 500);
    }
});

// Signed URL 생성
imagesRoutes.post('/:imageId/signed-url', async (c) => {
    try {
        const imageId = c.req.param('imageId');
        const body = await c.req.json();
        
        const signedURL = await generateSignedURL(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            imageId,
            body.variant || 'public',
            body.expiry || 3600
        );

        return c.json({
            success: true,
            signedURL,
            expiresIn: body.expiry || 3600
        });
    } catch (error) {
        console.error('Signed URL error:', error);
        return c.json({ 
            error: 'Failed to generate signed URL',
            message: error.message 
        }, 500);
    }
});

// 이미지 삭제
imagesRoutes.delete('/:imageId', async (c) => {
    try {
        const imageId = c.req.param('imageId');
        
        await deleteImage(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            imageId
        );

        return c.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Image deletion error:', error);
        return c.json({ 
            error: 'Failed to delete image',
            message: error.message 
        }, 500);
    }
});

// 프로필 이미지 업로드 (특화 엔드포인트)
imagesRoutes.post('/profile/upload', async (c) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get('image') as File;
        const userId = c.req.header('x-user-id');
        
        if (!file) {
            return c.json({ error: 'No image file provided' }, 400);
        }

        if (!userId) {
            return c.json({ error: 'User ID required' }, 401);
        }

        const imageData = await file.arrayBuffer();
        
        // 프로필 이미지용 메타데이터
        const metadata = {
            userId,
            type: 'profile',
            uploadedAt: new Date().toISOString()
        };

        const result = await uploadImage(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            imageData,
            {
                filename: `profile-${userId}-${Date.now()}.${file.name.split('.').pop()}`,
                metadata,
                requireSignedURLs: false
            }
        );

        // 프로필용 변형 URL들
        const profileUrls = {
            small: getImageURL(c.env.CF_ACCOUNT_HASH, result.id, 'avatar-sm'),
            medium: getImageURL(c.env.CF_ACCOUNT_HASH, result.id, 'avatar-md'),
            large: getImageURL(c.env.CF_ACCOUNT_HASH, result.id, 'avatar-lg'),
            original: getImageURL(c.env.CF_ACCOUNT_HASH, result.id, 'public')
        };

        return c.json({
            success: true,
            id: result.id,
            urls: profileUrls,
            metadata
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        return c.json({ 
            error: 'Failed to upload profile image',
            message: error.message 
        }, 500);
    }
});

// 변형(Variant) 생성
imagesRoutes.post('/variants', async (c) => {
    try {
        const body = await c.req.json();
        
        if (!body.id || !body.options) {
            return c.json({ 
                error: 'Variant ID and options are required' 
            }, 400);
        }

        await createVariant(
            c.env.CF_ACCOUNT_ID,
            c.env.CF_IMAGES_API_TOKEN,
            {
                id: body.id,
                options: body.options
            }
        );

        return c.json({
            success: true,
            message: 'Variant created successfully'
        });
    } catch (error) {
        console.error('Variant creation error:', error);
        return c.json({ 
            error: 'Failed to create variant',
            message: error.message 
        }, 500);
    }
});

// 기본 변형 초기화
imagesRoutes.post('/variants/init', async (c) => {
    try {
        const results = [];
        
        for (const variant of DEFAULT_VARIANTS) {
            try {
                await createVariant(
                    c.env.CF_ACCOUNT_ID,
                    c.env.CF_IMAGES_API_TOKEN,
                    variant
                );
                results.push({ 
                    id: variant.id, 
                    success: true 
                });
            } catch (error) {
                results.push({ 
                    id: variant.id, 
                    success: false, 
                    error: error.message 
                });
            }
        }

        return c.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Variant initialization error:', error);
        return c.json({ 
            error: 'Failed to initialize variants',
            message: error.message 
        }, 500);
    }
});

// 외부 이미지 변환 프록시
imagesRoutes.get('/transform', async (c) => {
    try {
        const url = c.req.query('url');
        if (!url) {
            return c.json({ error: 'URL parameter required' }, 400);
        }

        // 변환 옵션 파싱
        const options: any = {};
        const width = c.req.query('w');
        const height = c.req.query('h');
        const fit = c.req.query('fit');
        const quality = c.req.query('q');
        const format = c.req.query('f');

        if (width) options.width = parseInt(width);
        if (height) options.height = parseInt(height);
        if (fit) options.fit = fit;
        if (quality) options.quality = parseInt(quality);
        if (format) options.format = format;

        // Cloudflare Images 변환 URL로 리다이렉트
        const transformUrl = `https://imagedelivery.net/${c.env.CF_ACCOUNT_HASH}/${Object.entries(options).map(([k, v]) => `${k}=${v}`).join(',')}/${encodeURIComponent(url)}`;
        
        return c.redirect(transformUrl);
    } catch (error) {
        console.error('Transform proxy error:', error);
        return c.json({ 
            error: 'Failed to transform image',
            message: error.message 
        }, 500);
    }
});