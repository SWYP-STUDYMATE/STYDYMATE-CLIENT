// Cloudflare Images 서비스
// https://developers.cloudflare.com/images/

import { AppError } from '../utils/errors';

// 이미지 업로드 함수
export async function uploadImage(
    accountId: string,
    apiKey: string,
    imageData: ArrayBuffer | File | Blob | string,
    options: ImageUploadOptions = {}
): Promise<ImageUploadResponse> {
    try {
        const formData = new FormData();

        // 이미지 데이터 처리
        if (typeof imageData === 'string') {
            // Base64 문자열인 경우
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const blob = new Blob([binaryData], { type: 'image/png' });
            formData.append('file', blob, options.filename || 'image.png');
        } else if (imageData instanceof ArrayBuffer) {
            const blob = new Blob([imageData], { type: options.contentType || 'image/png' });
            formData.append('file', blob, options.filename || 'image.png');
        } else {
            formData.append('file', imageData);
        }

        // 메타데이터 추가
        if (options.metadata) {
            formData.append('metadata', JSON.stringify(options.metadata));
        }

        // 커스텀 ID 설정
        if (options.id) {
            formData.append('id', options.id);
        }

        // 변형 옵션 설정
        if (options.requireSignedURLs) {
            formData.append('requireSignedURLs', 'true');
        }

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'CLOUDFLARE_IMAGES_ERROR',
                'Failed to upload image',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return {
            id: result.result.id,
            uploadURL: result.result.uploadURL,
            variants: result.result.variants,
            requireSignedURLs: result.result.requireSignedURLs,
            metadata: result.result.metadata
        };
    } catch (error) {
        console.error('Cloudflare Images upload error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'IMAGE_UPLOAD_ERROR',
            'Failed to upload image',
            error.message
        );
    }
}

// 직접 업로드 URL 생성
export async function createDirectUploadURL(
    accountId: string,
    apiKey: string,
    options: DirectUploadOptions = {}
): Promise<DirectUploadResponse> {
    try {
        const body: any = {};

        if (options.expiry) {
            body.expiry = options.expiry.toISOString();
        }

        if (options.metadata) {
            body.metadata = options.metadata;
        }

        if (options.requireSignedURLs !== undefined) {
            body.requireSignedURLs = options.requireSignedURLs;
        }

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'DIRECT_UPLOAD_ERROR',
                'Failed to create direct upload URL',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return {
            id: result.result.id,
            uploadURL: result.result.uploadURL
        };
    } catch (error) {
        console.error('Direct upload URL error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'DIRECT_UPLOAD_ERROR',
            'Failed to create direct upload URL',
            error.message
        );
    }
}

// 이미지 변형 URL 생성
export function getImageURL(
    accountHash: string,
    imageId: string,
    variant: string = 'public'
): string {
    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

// Signed URL 생성
export async function generateSignedURL(
    accountId: string,
    apiKey: string,
    imageId: string,
    variant: string = 'public',
    expiry: number = 3600
): Promise<string> {
    try {
        const expiryDate = new Date(Date.now() + expiry * 1000);

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}/signed_url`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    variant,
                    expiry: expiryDate.toISOString()
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'SIGNED_URL_ERROR',
                'Failed to generate signed URL',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return result.result.signedURL;
    } catch (error) {
        console.error('Signed URL generation error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'SIGNED_URL_ERROR',
            'Failed to generate signed URL',
            error.message
        );
    }
}

// 이미지 삭제
export async function deleteImage(
    accountId: string,
    apiKey: string,
    imageId: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'IMAGE_DELETE_ERROR',
                'Failed to delete image',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return true;
    } catch (error) {
        console.error('Image deletion error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'IMAGE_DELETE_ERROR',
            'Failed to delete image',
            error.message
        );
    }
}

// 이미지 목록 조회
export async function listImages(
    accountId: string,
    apiKey: string,
    options: ListImagesOptions = {}
): Promise<ListImagesResponse> {
    try {
        const params = new URLSearchParams();

        if (options.page) params.append('page', options.page.toString());
        if (options.perPage) params.append('per_page', options.perPage.toString());

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1?${params}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'IMAGE_LIST_ERROR',
                'Failed to list images',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return {
            images: result.result.images.map((img: any) => ({
                id: img.id,
                filename: img.filename,
                uploaded: img.uploaded,
                variants: img.variants,
                requireSignedURLs: img.requireSignedURLs,
                metadata: img.metadata
            })),
            total: result.result_info.total_count,
            page: result.result_info.page,
            perPage: result.result_info.per_page
        };
    } catch (error) {
        console.error('Image list error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'IMAGE_LIST_ERROR',
            'Failed to list images',
            error.message
        );
    }
}

// 이미지 상세 정보 조회
export async function getImageDetails(
    accountId: string,
    apiKey: string,
    imageId: string
): Promise<ImageDetails> {
    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'IMAGE_DETAILS_ERROR',
                'Failed to get image details',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return {
            id: result.result.id,
            filename: result.result.filename,
            uploaded: result.result.uploaded,
            variants: result.result.variants,
            requireSignedURLs: result.result.requireSignedURLs,
            metadata: result.result.metadata,
            size: result.result.size
        };
    } catch (error) {
        console.error('Image details error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'IMAGE_DETAILS_ERROR',
            'Failed to get image details',
            error.message
        );
    }
}

// 변형(Variant) 생성
export async function createVariant(
    accountId: string,
    apiKey: string,
    variant: ImageVariant
): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/variants`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: variant.id,
                    options: variant.options
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new AppError(
                response.status,
                'VARIANT_CREATE_ERROR',
                'Failed to create variant',
                result.errors?.[0]?.message || 'Unknown error'
            );
        }

        return true;
    } catch (error) {
        console.error('Variant creation error:', error);
        if (error instanceof AppError) throw error;
        throw new AppError(
            500,
            'VARIANT_CREATE_ERROR',
            'Failed to create variant',
            error.message
        );
    }
}

// 이미지 변환 URL 생성 (외부 이미지)
export function getTransformURL(
    accountHash: string,
    transformOptions: TransformOptions,
    sourceUrl: string
): string {
    const options = [];

    if (transformOptions.width) options.push(`w=${transformOptions.width}`);
    if (transformOptions.height) options.push(`h=${transformOptions.height}`);
    if (transformOptions.fit) options.push(`fit=${transformOptions.fit}`);
    if (transformOptions.gravity) options.push(`gravity=${transformOptions.gravity}`);
    if (transformOptions.quality) options.push(`q=${transformOptions.quality}`);
    if (transformOptions.format) options.push(`f=${transformOptions.format}`);
    if (transformOptions.blur) options.push(`blur=${transformOptions.blur}`);
    if (transformOptions.sharpen) options.push(`sharpen=${transformOptions.sharpen}`);
    if (transformOptions.background) options.push(`background=${transformOptions.background}`);

    const optionsString = options.join(',');
    return `https://imagedelivery.net/${accountHash}/${optionsString}/${encodeURIComponent(sourceUrl)}`;
}

// 프로필 이미지 최적화 헬퍼
export function getProfileImageURL(
    accountHash: string,
    imageId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
): string {
    const sizeMap = {
        small: 'avatar-sm',    // 64x64
        medium: 'avatar-md',   // 128x128
        large: 'avatar-lg'     // 256x256
    };

    return getImageURL(accountHash, imageId, sizeMap[size]);
}

// Type definitions
export interface ImageUploadOptions {
    id?: string;
    filename?: string;
    contentType?: string;
    metadata?: Record<string, any>;
    requireSignedURLs?: boolean;
}

export interface ImageUploadResponse {
    id: string;
    uploadURL: string;
    variants: string[];
    requireSignedURLs: boolean;
    metadata?: Record<string, any>;
}

export interface DirectUploadOptions {
    expiry?: Date;
    metadata?: Record<string, any>;
    requireSignedURLs?: boolean;
}

export interface DirectUploadResponse {
    id: string;
    uploadURL: string;
}

export interface ListImagesOptions {
    page?: number;
    perPage?: number;
}

export interface ListImagesResponse {
    images: ImageSummary[];
    total: number;
    page: number;
    perPage: number;
}

export interface ImageSummary {
    id: string;
    filename: string;
    uploaded: string;
    variants: string[];
    requireSignedURLs: boolean;
    metadata?: Record<string, any>;
}

export interface ImageDetails extends ImageSummary {
    size: number;
}

export interface ImageVariant {
    id: string;
    options: {
        fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
        width?: number;
        height?: number;
        gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center';
        quality?: number;
        format?: 'auto' | 'avif' | 'webp' | 'json';
        background?: string;
        blur?: number;
        sharpen?: number;
        metadata?: 'keep' | 'copyright' | 'none';
    };
}

export interface TransformOptions {
    width?: number;
    height?: number;
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center' | 'face';
    quality?: number;
    format?: 'auto' | 'avif' | 'webp' | 'json';
    blur?: number;
    sharpen?: number;
    background?: string;
}

// 기본 변형 설정
export const DEFAULT_VARIANTS: ImageVariant[] = [
    {
        id: 'public',
        options: {
            fit: 'scale-down',
            width: 1280,
            quality: 85,
            format: 'auto'
        }
    },
    {
        id: 'thumbnail',
        options: {
            fit: 'cover',
            width: 200,
            height: 200,
            quality: 80,
            format: 'auto'
        }
    },
    {
        id: 'avatar-sm',
        options: {
            fit: 'cover',
            width: 64,
            height: 64,
            quality: 80,
            format: 'auto'
        }
    },
    {
        id: 'avatar-md',
        options: {
            fit: 'cover',
            width: 128,
            height: 128,
            quality: 85,
            format: 'auto'
        }
    },
    {
        id: 'avatar-lg',
        options: {
            fit: 'cover',
            width: 256,
            height: 256,
            quality: 90,
            format: 'auto'
        }
    },
    {
        id: 'hero',
        options: {
            fit: 'cover',
            width: 1920,
            height: 600,
            quality: 85,
            format: 'auto'
        }
    }
];