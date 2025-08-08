# Whisper API Documentation

## Overview

StudyMate API provides speech-to-text capabilities using OpenAI's Whisper model via Cloudflare Workers AI. The API supports multiple languages, large file processing with automatic chunking, and various transcription options.

## Base URL

```
https://studymate-api.wjstks3474.workers.dev/api/whisper
```

## Endpoints

### 1. Transcribe Audio

Transcribe audio files to text with support for multiple languages and formats.

**Endpoint:** `POST /api/whisper/transcribe`

#### Request Options

##### Option 1: Multipart Form Data

```bash
curl -X POST https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe \
  -F "audio=@speech.mp3" \
  -F "language=auto" \
  -F "task=transcribe"
```

##### Option 2: JSON with Base64 Audio

```javascript
const response = await fetch('https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio: base64AudioData,
    options: {
      language: 'en',
      task: 'transcribe'
    }
  })
});
```

##### Option 3: Direct Binary Upload

```javascript
const audioBlob = await fetch('audio-file-url').then(r => r.blob());

const response = await fetch('https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'audio/mpeg'
  },
  body: audioBlob
});
```

#### Parameters

| Parameter        | Type               | Default      | Description                                                    |
| ---------------- | ------------------ | ------------ | -------------------------------------------------------------- |
| `audio`          | File/String/Binary | Required     | Audio file (multipart), base64 string (JSON), or raw binary    |
| `task`           | String             | `transcribe` | Task type: `transcribe` or `translate`                         |
| `language`       | String             | `auto`       | Language code (e.g., 'en', 'ko', 'ja') or 'auto' for detection |
| `vad_filter`     | Boolean            | `true`       | Enable Voice Activity Detection                                |
| `initial_prompt` | String             | -            | Context to help with transcription accuracy                    |
| `prefix`         | String             | -            | Text to prepend to the transcription                           |

#### Response

```json
{
  "success": true,
  "transcription": "Hello, this is a test audio transcription.",
  "word_count": 7,
  "words": [
    {
      "word": "Hello",
      "start": 0.0,
      "end": 0.5
    },
    {
      "word": "this",
      "start": 0.6,
      "end": 0.8
    }
    // ... more words
  ],
  "chunks_processed": 1,
  "language": "en",
  "task": "transcribe"
}
```

### 2. Get Supported Languages

Get a list of all supported languages for transcription.

**Endpoint:** `GET /api/whisper/languages`

#### Response

```json
{
  "supported_languages": [
    { "code": "auto", "name": "Auto-detect" },
    { "code": "en", "name": "English" },
    { "code": "ko", "name": "Korean" },
    { "code": "ja", "name": "Japanese" },
    { "code": "zh", "name": "Chinese" },
    // ... 90+ languages
  ]
}
```

### 3. Get Available Models

Get information about available Whisper models.

**Endpoint:** `GET /api/whisper/models`

#### Response

```json
{
  "available_models": [
    {
      "id": "@cf/openai/whisper-large-v3-turbo",
      "name": "Whisper Large v3 Turbo",
      "description": "Large model optimized for speed and accuracy",
      "languages": "Multilingual",
      "max_duration": "30 minutes",
      "pricing": "$0.00045 per audio minute",
      "recommended": true
    }
    // ... more models
  ]
}
```

## Usage Examples

### JavaScript/TypeScript Example

```typescript
// Example: Transcribe audio from file input
async function transcribeAudio(file: File, language: string = 'auto') {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('language', language);
  formData.append('task', 'transcribe');

  try {
    const response = await fetch('https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Transcription:', result.transcription);
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Example: Translate audio to English
async function translateAudio(audioUrl: string) {
  const audioResponse = await fetch(audioUrl);
  const audioBlob = await audioResponse.blob();

  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('task', 'translate'); // Translates to English
  formData.append('language', 'auto'); // Auto-detect source language

  const response = await fetch('https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe', {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

### React Example

```jsx
import { useState } from 'react';

function AudioTranscriber() {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('language', 'auto');

    try {
      const response = await fetch('https://studymate-api.wjstks3474.workers.dev/api/whisper/transcribe', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setTranscription(result.transcription);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && <p>Transcribing...</p>}
      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
}
```

## Audio Format Support

The API supports various audio formats including:
- MP3
- WAV
- M4A
- FLAC
- OGG
- WebM

## Limitations

- Maximum file size: 25MB
- Maximum duration: 30 minutes
- Large files are automatically split into 1MB chunks for processing

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad request (missing audio, file too large, etc.)
- `500`: Internal server error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Best Practices

1. **Language Detection**: Use `language: 'auto'` for automatic language detection, but specify the language if known for better accuracy.

2. **Large Files**: Files larger than 1MB are automatically chunked. The API handles this transparently.

3. **Context**: Provide `initial_prompt` with context about the audio content for improved accuracy.

4. **Audio Quality**: Higher quality audio (clear speech, minimal background noise) produces better transcriptions.

5. **Rate Limiting**: Be mindful of rate limits. Consider implementing retry logic with exponential backoff.

## Pricing

- $0.00045 per audio minute
- Billed based on audio duration, not processing time
- Chunked files are billed for total audio duration