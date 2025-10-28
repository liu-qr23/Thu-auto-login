// ==UserScript==
// @name         Tsinghua Auto Login & Save
// @namespace    https://id.tsinghua.edu.cn/
// @version      0.3
// @description  首次自动保存用户名密码，后续自动填充并点击登录
// @match        https://id.tsinghua.edu.cn/do/off/ui/auth/login/*
// @match        https://learn.tsinghua.edu.cn/f/wlxt/index/course/student/
// @grant        none
// ==/UserScript==

(function () {
    var STORAGE_SALT = 'Crazy_THU_Vivo_50';
    var textToChars = function(text) { return text.split('').map(function(c) { return c.charCodeAt(0); }); };
    var byteHex = function(n) { return ('0' + Number(n).toString(16)).slice(-2); };
    var applySaltToChar = function(salt) {
        return function(code) {
            return textToChars(salt).reduce(function(a, b) { return a ^ b; }, code);
        };
    };
    var cipher = function(salt) {
        return function(text) {
            return textToChars(text).map(applySaltToChar(salt)).map(byteHex).join('');
        };
    };
    var decipher = function(salt) {
        return function(encoded) {
            return encoded.match(/.{1,2}/g).map(function(hex) { return parseInt(hex, 16); })
                .map(applySaltToChar(salt))
                .map(function(charCode) { return String.fromCharCode(charCode); })
                .join('');
        };
    };

    // 网络学堂自动点击
    var chongxinBtn = Array.from(document.querySelectorAll('a.chongxin')).find(function(btn) {
        return btn.textContent.trim() === '登录网络学堂' && btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("top.document.location='/");
    });
    if (chongxinBtn) {
        chongxinBtn.click();
        return;
    }

    // 用户名/密码输入框选择器
    var userSelector = 'input[name="i_user"]';
    var passSelector = 'input[name="i_pass"]';
    var btnSelector = 'a.btn.btn-lg.btn-primary.btn-block[onclick^="doLogin"]';

    var userInput = document.querySelector(userSelector);
    var passInput = document.querySelector(passSelector);
    var btn = document.querySelector(btnSelector);

    // 本地存储 key
    var userKey = 'thuid_auto_user';
    var passKey = 'thuid_auto_pass';

    // 自动点击跳转链接（排除忘记密码等干扰链接）
    var jumpLink = document.querySelector('a[href]:not([href*="forget"]):not([href*="register"]):not([href="#"])');
    if (jumpLink && jumpLink.getAttribute('href') && jumpLink.getAttribute('href').startsWith('http')) {
        jumpLink.click();
        return;
    }

    // 自动填充（使用解密）
    var savedUser = localStorage.getItem(userKey);
    var savedPass = localStorage.getItem(passKey);
    if (userInput && passInput && savedUser && savedPass) {
        try {
            var decipherImpl = decipher(STORAGE_SALT);
            userInput.value = decipherImpl(savedUser);
            passInput.value = decipherImpl(savedPass);
            if (btn) btn.click();
            return;
        } catch (e) {
            // 解密失败，清除旧数据
            localStorage.removeItem(userKey);
            localStorage.removeItem(passKey);
        }
    }

    // 首次保存（使用加密）
    if (userInput && passInput && btn) {
        btn.addEventListener('click', function () {
            var u = userInput.value;
            var p = passInput.value;
            if (u && p) {
                var cipherImpl = cipher(STORAGE_SALT);
                localStorage.setItem(userKey, cipherImpl(u));
                localStorage.setItem(passKey, cipherImpl(p));
            }
        }, { once: true });
    }
})();
