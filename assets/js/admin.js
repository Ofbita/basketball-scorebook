/**
 * 管理画面用JavaScript
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // クリップボードコピー機能
        const copyButtons = document.querySelectorAll('[data-clipboard-target]');
        
        copyButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-clipboard-target');
                const targetElement = document.getElementById(targetId);
                
                if (!targetElement) {
                    return;
                }
                
                const text = targetElement.textContent;
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function() {
                        alert('コピーしました!');
                    }).catch(function() {
                        fallbackCopyToClipboard(text);
                    });
                } else {
                    fallbackCopyToClipboard(text);
                }
            });
        });
        
        /**
         * フォールバックのコピー機能
         */
        function fallbackCopyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                alert('コピーしました!');
            } catch (err) {
                alert('コピーに失敗しました。手動でコピーしてください。');
            }
            
            document.body.removeChild(textarea);
        }
    });
})();
