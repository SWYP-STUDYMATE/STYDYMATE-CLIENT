import { Hono } from 'hono';
import { Env } from '../index';
import { 
  findMatches, 
  storeMatchRequest, 
  removeMatchRequest,
  MatchingRequest 
} from '../services/calls';
import { authMiddleware, getUser, checkRateLimit } from '../utils/auth';
import { ValidationError, validateRequired } from '../utils/errors';

export const matchingRoutes = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
matchingRoutes.use('*', authMiddleware);

// Submit matching request
matchingRoutes.post('/request', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Rate limiting: 5 requests per hour
    const allowed = await checkRateLimit(c.env, user.userId, 'matching', 5, 3600);
    if (!allowed) {
      return c.json({ error: 'Too many matching requests' }, 429);
    }

    const body = await c.req.json();
    
    // Validate required fields
    validateRequired(body, [
      'userLevel',
      'targetLanguage',
      'nativeLanguage',
      'interests',
      'availability'
    ]);

    const request: MatchingRequest = {
      userId: user.userId,
      userLevel: body.userLevel,
      targetLanguage: body.targetLanguage,
      nativeLanguage: body.nativeLanguage,
      interests: body.interests || [],
      availability: body.availability || [],
      preferredCallType: body.preferredCallType || 'both'
    };

    // Store request
    await storeMatchRequest(c.env, request);

    // Find matches
    const matches = await findMatches(c.env, request);

    return c.json({
      success: true,
      requestId: user.userId,
      matches,
      message: matches.length > 0 
        ? `Found ${matches.length} potential matches`
        : 'No matches found yet. We\'ll notify you when someone compatible joins!'
    });
  } catch (error) {
    console.error('Matching request error:', error);
    if (error instanceof ValidationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: 'Failed to process matching request' }, 500);
  }
});

// Get my matches
matchingRoutes.get('/my-matches', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get stored request
    const requestData = await c.env.CACHE.get(`match:pending:${user.userId}`);
    if (!requestData) {
      return c.json({
        success: true,
        matches: [],
        message: 'No active matching request. Submit a request to find partners.'
      });
    }

    const request: MatchingRequest = JSON.parse(requestData);
    const matches = await findMatches(c.env, request);

    return c.json({
      success: true,
      matches,
      request
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return c.json({ error: 'Failed to retrieve matches' }, 500);
  }
});

// Accept a match
matchingRoutes.post('/accept/:matchId', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const matchId = c.req.param('matchId');
    const { partnerId, roomType } = await c.req.json();

    // Create a room for the matched users
    const roomId = crypto.randomUUID();
    
    // Store match acceptance
    await c.env.CACHE.put(
      `match:accepted:${matchId}`,
      JSON.stringify({
        matchId,
        userId: user.userId,
        partnerId,
        roomId,
        acceptedAt: new Date().toISOString(),
        roomType: roomType || 'audio'
      }),
      { expirationTtl: 86400 } // 24 hours
    );

    // Notify partner (in production, would use push notifications)
    await c.env.CACHE.put(
      `notification:${partnerId}`,
      JSON.stringify({
        type: 'match_accepted',
        from: user.userId,
        roomId,
        timestamp: new Date().toISOString()
      }),
      { expirationTtl: 3600 } // 1 hour
    );

    // Remove from pending
    await removeMatchRequest(c.env, user.userId);

    return c.json({
      success: true,
      roomId,
      message: 'Match accepted! You can now start a conversation.'
    });
  } catch (error) {
    console.error('Accept match error:', error);
    return c.json({ error: 'Failed to accept match' }, 500);
  }
});

// Reject a match
matchingRoutes.post('/reject/:matchId', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const matchId = c.req.param('matchId');
    
    // Store rejection to avoid re-matching
    await c.env.CACHE.put(
      `match:rejected:${user.userId}:${matchId}`,
      'true',
      { expirationTtl: 604800 } // 7 days
    );

    return c.json({
      success: true,
      message: 'Match rejected'
    });
  } catch (error) {
    console.error('Reject match error:', error);
    return c.json({ error: 'Failed to reject match' }, 500);
  }
});

// Cancel matching request
matchingRoutes.delete('/request', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await removeMatchRequest(c.env, user.userId);

    return c.json({
      success: true,
      message: 'Matching request cancelled'
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    return c.json({ error: 'Failed to cancel request' }, 500);
  }
});

// Get matching statistics
matchingRoutes.get('/stats', async (c) => {
  try {
    const user = getUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's matching stats from cache
    const stats = {
      totalMatches: 0,
      acceptedMatches: 0,
      rejectedMatches: 0,
      activeRequest: false
    };

    // Check for active request
    const activeRequest = await c.env.CACHE.get(`match:pending:${user.userId}`);
    stats.activeRequest = !!activeRequest;

    // Get accepted matches count (would typically query a database)
    const acceptedKeys = await c.env.CACHE.list({ 
      prefix: `match:accepted:`,
      limit: 100
    });
    
    for (const key of acceptedKeys.keys) {
      const data = await c.env.CACHE.get(key.name);
      if (data) {
        const match = JSON.parse(data);
        if (match.userId === user.userId || match.partnerId === user.userId) {
          stats.acceptedMatches++;
        }
      }
    }

    return c.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to retrieve statistics' }, 500);
  }
});