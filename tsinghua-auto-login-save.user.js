// ==UserScript==
// @name         Tsinghua Auto Login & Save
// @namespace    https://id.tsinghua.edu.cn/
// @version      0.4
// @description  首次自动保存用户名密码，后续自动填充并点击登录
// @match        https://id.tsinghua.edu.cn/do/off/ui/auth/login/*
// @match        https://learn.tsinghua.edu.cn/f/wlxt/index/course/student/
// @match        https://learn.tsinghua.edu.cn/f/login
// @match        https://zhjwxk.cic.tsinghua.edu.cn/id_xsxk_error.jsp?login_error=timeError
// @grant        none
// ==/UserScript==

(function () {
    // 请把下面的值替换为你自己的账号/密码。
    var ACCOUNTS = [
        { user: '12345678', pass: '12345678' }
    ];

    // 网络学堂自动点击
    var chongxinBtn = Array.from(document.querySelectorAll('a.chongxin')).find(function (btn) {
        return btn.textContent.trim() === '登录网络学堂' && btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("top.document.location='/");
    });
    if (chongxinBtn) {
        chongxinBtn.click();
        return;
    }

    var loginButtonById = document.getElementById('loginButtonId');
    if (loginButtonById) {
        loginButtonById.click();
        return;
    }

    // 自动点击跳转链接
    var jumpLink = document.querySelector('a[href]:not([href*="forget"]):not([href*="register"]):not([href="#"])');
    if (jumpLink && jumpLink.getAttribute('href') && jumpLink.getAttribute('href').startsWith('http')) {
        jumpLink.click();
        return;
    }

    // 自动点击选课登录入口
    var xkLink = Array.from(document.querySelectorAll('a[href]')).find(function (a) {
        var h = a.getAttribute('href') || '';
        var t = (a.textContent || '').trim();
        console.log('检查链接:', h, '文本:', t);
        return h === '/xklogin.do' || h.endsWith('/xklogin.do') || t.indexOf('点此跳转选课登录入口') !== -1;
    });
    if (xkLink) {
        xkLink.click();
        return;
    }

    // 用户名/密码输入框选择器
    var btnSelector = 'a.btn.btn-lg.btn-primary.btn-block[onclick^="doLogin"]';
    var btn = document.querySelector(btnSelector);

    // 直接填充第一个账号（如果需要使用第二个账号，把下面的索引改为 1）
    var userInput = document.querySelector('#i_user');
    var passInput = document.querySelector('#i_pass');
    if (userInput && passInput) {
        var acct = ACCOUNTS[0];
        userInput.value = acct.user;
        passInput.value = acct.pass;
        if (btn) btn.click();
        return;
    }
})();
