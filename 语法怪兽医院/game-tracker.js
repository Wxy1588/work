(function (global) {
    'use strict';

    function createId(prefix) {
        if (global.crypto && global.crypto.randomUUID) {
            return prefix + '-' + global.crypto.randomUUID();
        }
        return prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    }

    function GameTracker(options) {
        options = options || {};
        if (!options.gameId) throw new Error('GameTracker requires gameId');
        this.apiUrl = options.apiUrl || 'http://127.0.0.1:8000/api/v1/events';
        this.gameId = options.gameId;
        this.gameVersion = options.gameVersion || null;
        this.getUserId = options.getUserId || function () { return null; };
        this.sessionId = null;
        this.finished = false;
    }

    GameTracker.prototype._report = function (eventType, score) {
        if (!this.sessionId) return Promise.resolve({ skipped: true });
        var userId = this.getUserId();
        var payload = {
            event_id: createId(eventType),
            event_type: eventType,
            session_id: this.sessionId,
            user_id: userId && userId !== 'unknown' ? String(userId) : null,
            game_id: this.gameId,
            occurred_at: new Date().toISOString(),
            game_version: this.gameVersion
        };
        if (eventType === 'game_finished') payload.score = score;
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        }).then(function (response) {
            if (!response.ok) throw new Error('Data server returned HTTP ' + response.status);
            return response.json();
        }).catch(function (error) {
            console.warn('[GameTracker] Data was not reported:', error);
            return { accepted: false, error: error.message };
        });
    };

    GameTracker.prototype.start = function () {
        this.sessionId = createId('session');
        this.finished = false;
        this._report('game_started');
        return this.sessionId;
    };

    GameTracker.prototype.finish = function (score) {
        if (!this.sessionId || this.finished) return Promise.resolve({ skipped: true });
        if (typeof score !== 'number' || !Number.isFinite(score)) {
            throw new Error('GameTracker.finish(score) requires a finite number');
        }
        this.finished = true;
        return this._report('game_finished', score);
    };

    GameTracker.prototype.abandon = function () {
        this.sessionId = null;
        this.finished = false;
    };

    global.GameTracker = GameTracker;
})(window);

