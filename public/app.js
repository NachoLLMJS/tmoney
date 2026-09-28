const dialog = document.querySelector('#bot-dialog');
const closeButton = document.querySelector('.dialog-close');
const dialogTitle = document.querySelector('#dialog-title');
const dialogCopy = document.querySelector('#dialog-copy');
const dialogLink = document.querySelector('#dialog-link');
const twitterButton = document.querySelector('#twitter-link');
const socialNotice = document.querySelector('#social-notice');

let botConfig = { botConfigured: false, botUrl: null, botUsername: null };

fetch('/api/config.json')
  .then((response) => response.json())
  .then((config) => { botConfig = config; })
  .catch(() => undefined);

function openBot() {
  if (botConfig.botConfigured && botConfig.botUrl) {
    dialogTitle.textContent = `@${botConfig.botUsername} 已准备好`;
    dialogCopy.textContent = '打开机器人并点击开始，然后转发提到 TMONEY 的 Telegram 原始消息';
    dialogLink.href = botConfig.botUrl;
    dialogLink.classList.remove('hidden');
  } else {
    dialogTitle.textContent = '机器人信息待配置';
    dialogCopy.textContent = '请在桌面环境文件中添加机器人令牌和用户名，然后重新启动 TMONEY';
    dialogLink.classList.add('hidden');
    dialogLink.removeAttribute('href');
  }
  dialog.showModal();
}

document.querySelectorAll('.js-claim').forEach((button) => button.addEventListener('click', openBot));
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

let noticeTimer;
twitterButton.addEventListener('click', () => {
  socialNotice.classList.add('show');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => socialNotice.classList.remove('show'), 2200);
});
