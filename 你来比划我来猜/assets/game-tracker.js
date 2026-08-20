(function (global) {
  'use strict';
  var cachedStudentInfo = null;
  var bridgeWarningShown = false;
  var STATUS_NAMES = {
    '0': '未触达',
    '1': '触达',
    '2': '意向',
    '3': '试听',
    '4': '正式',
    '5': '退费',
    '6': '结课'
  };

  function id(prefix) {
    if (global.crypto && global.crypto.randomUUID) return prefix + '-' + global.crypto.randomUUID();
    return prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }
  function readLaunchParam(name) {
    var storageKey = 'gamePlatform.' + name;
    var params = new URLSearchParams(global.location.search);
    if (params.has(name)) {
      var value = params.get(name) || '';
      try { global.sessionStorage.setItem(storageKey, value); } catch (_) {}
      return value;
    }
    try { return global.sessionStorage.getItem(storageKey); } catch (_) { return null; }
  }
  function readStudentInfo() {
    if (cachedStudentInfo) return cachedStudentInfo;
    if (!global.axxBridge || typeof global.axxBridge.getStudentBasicInfo !== 'function') return null;

    try {
      var value = global.axxBridge.getStudentBasicInfo();
      if (typeof value === 'string') value = JSON.parse(value);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        cachedStudentInfo = value;
        return cachedStudentInfo;
      }
    } catch (error) {
      if (!bridgeWarningShown) {
        bridgeWarningShown = true;
        console.warn('[GameTracker] Could not read student basic info from the app bridge:', error);
      }
    }
    return null;
  }
  function mapStatusName(status) {
    if (status === null || status === undefined || status === '') return null;
    return STATUS_NAMES[String(status)] || null;
  }
  function getPlatformContext() {
    var context = {
      id: readLaunchParam('id'),
      clueName: readLaunchParam('clueName'),
      deptId: readLaunchParam('deptId'),
      deptName: readLaunchParam('deptName')
    };
    var studentInfo = readStudentInfo();
    context.status = studentInfo ? studentInfo.status : null;
    context.statusName = mapStatusName(context.status);
    context.gradeId = studentInfo ? studentInfo.gradeId : null;
    context.gradeName = studentInfo ? studentInfo.gradeName : null;
    global.gamePlatformContext = context;
    return context;
  }
  function reportValue(value) {
    return value && value !== 'unknown' ? String(value) : null;
  }
  function studentReportValue(value) {
    return value !== null && value !== undefined && value !== '' && value !== 'unknown' ? String(value) : null;
  }
  function detectAppEnvironment() {
    var hostname = String(global.location && global.location.hostname || '').toLowerCase();
    var pathname = String(global.location && global.location.pathname || '').toLowerCase();
    return hostname === 'axx-pm-test.oss-cn-beijing.aliyuncs.com' && pathname.indexOf('/game-platform-test/') === 0
      ? 'test'
      : 'production';
  }
  function GameTracker(options) {
    options = options || {};
    if (!options.gameId) throw new Error('GameTracker requires gameId');
    this.apiUrl = options.apiUrl || 'https://english-game-service.suannaiclass.com/api/v1/events';
    this.gameId = options.gameId;
    this.gameVersion = options.gameVersion || null;
    this.appEnvironment = options.appEnvironment || detectAppEnvironment();
    if (['production', 'test'].indexOf(this.appEnvironment) === -1) {
      throw new Error('GameTracker appEnvironment must be production or test');
    }
    this.getUserId = options.getUserId || function () { return null; };
    this.getStoreId = options.getStoreId || function () { return null; };
    this.getStudentId = options.getStudentId || function () { return getPlatformContext().id; };
    this.getClueName = options.getClueName || function () { return getPlatformContext().clueName; };
    this.getDeptId = options.getDeptId || function () { return getPlatformContext().deptId; };
    this.getDeptName = options.getDeptName || function () { return getPlatformContext().deptName; };
    this.getStatus = options.getStatus || function () { return getPlatformContext().status; };
    this.getStatusName = options.getStatusName || function () { return getPlatformContext().statusName; };
    this.getGradeId = options.getGradeId || function () { return getPlatformContext().gradeId; };
    this.getGradeName = options.getGradeName || function () { return getPlatformContext().gradeName; };
    this.sessionId = null;
    this.finished = false;
  }
  GameTracker.prototype._report = function (type, details) {
    if (!this.sessionId) return Promise.resolve({ skipped: true });
    var studentId = this.getStudentId();
    var clueName = this.getClueName();
    var deptId = this.getDeptId();
    var deptName = this.getDeptName();
    var status = this.getStatus();
    var statusName = this.getStatusName();
    var gradeId = this.getGradeId();
    var gradeName = this.getGradeName();
    var userId = this.getUserId() || studentId;
    var storeId = this.getStoreId() || deptId;
    var payload = { event_id: id(type), event_type: type, session_id: this.sessionId,
      app_environment: this.appEnvironment,
      user_id: reportValue(userId), store_id: reportValue(storeId),
      id: reportValue(studentId), clueName: reportValue(clueName),
      deptId: reportValue(deptId), deptName: reportValue(deptName),
      status: studentReportValue(status), statusName: studentReportValue(statusName),
      gradeId: studentReportValue(gradeId), gradeName: studentReportValue(gradeName),
      game_id: this.gameId, occurred_at: new Date().toISOString(), game_version: this.gameVersion };
    if (typeof details === 'number') {
      payload.score = details;
    } else if (details && typeof details === 'object') {
      Object.keys(details).forEach(function (key) {
        if (!['event_id', 'event_type', 'session_id', 'app_environment', 'user_id', 'store_id', 'id', 'clueName', 'deptId', 'deptName',
          'status', 'statusName', 'gradeId', 'gradeName', 'game_id', 'occurred_at', 'game_version'].includes(key)
          && details[key] !== undefined) payload[key] = details[key];
      });
    }
    console.log('[GameTracker] Reporting payload:', JSON.stringify(payload));
    return fetch(this.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload), keepalive: true }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }).catch(function (error) {
      console.warn('[GameTracker] Data was not reported:', error);
      return { accepted: false, error: error.message };
    });
  };
  GameTracker.prototype.start = function (details) { this.sessionId = id('session'); this.finished = false; this._report('game_started', details); return this.sessionId; };
  GameTracker.prototype.track = function (eventType, details) {
    if (!this.sessionId) return Promise.resolve({ skipped: true });
    return this._report(eventType, details);
  };
  GameTracker.prototype.questionAnswered = function (details) {
    if (this.finished) return Promise.resolve({ skipped: true });
    return this.track('question_answered', details);
  };
  GameTracker.prototype.reportViewed = function (details) {
    return this.track('report_viewed', details);
  };
  GameTracker.prototype.finish = function (score, details) {
    if (!this.sessionId || this.finished) return Promise.resolve({ skipped: true });
    if (typeof score !== 'number' || !Number.isFinite(score)) throw new Error('finish(score) requires a finite number');
    this.finished = true; return this._report('game_finished', Object.assign({}, details, { score: score }));
  };
  GameTracker.prototype.abandon = function (details) {
    var result = (!this.sessionId || this.finished) ? Promise.resolve({ skipped: true })
      : this._report('game_abandoned', Object.assign({}, details, { is_abandoned: true }));
    this.sessionId = null; this.finished = false; return result;
  };
  global.getGamePlatformContext = getPlatformContext;
  global.GameTracker = GameTracker;
  global.createPlatformGameTracker = function (gameId, gameVersion) {
    return new GameTracker({ gameId: gameId, gameVersion: gameVersion || '1.1', getUserId: function () {
      return new URLSearchParams(global.location.search).get('user_id');
    }, getStoreId: function () {
      return new URLSearchParams(global.location.search).get('store_id');
    }});
  };
})(window);
