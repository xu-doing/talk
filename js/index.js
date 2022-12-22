(async function () {
  const resp = await API.profile();
  const user = resp.data;
  if (!user) {
    alert("未登陆或登录已经过期，请重新登录");
    location.href = "./login.html";
    return;
  }

  //登录成功
  const doms = {
    asdie: {
      nickname: $("#nickname"),
      loginId: $("#loginId"),
    },
    close: $(".close"),
    chatContainer: $(".chat-container"),
    txtMsg: $("#txtMsg"),
    msgContainer: $(".msg-container"),
  };
  setUserInfo();

  //注销事件
  doms.close.onclick = function () {
    API.loginOut();
    location.href = "./login.html";
  };

  //加载历史记录
  await loadHistory();
  async function loadHistory() {
    const resp = await API.getHistory();
    for (const item of resp.data) {
      addChat(item);
    }
    scrollBottom();
  }
  //发送消息
  doms.msgContainer.onsubmit = function (e) {
    e.preventDefault();
    sendChat();
  };
  //设置用户消息
  function setUserInfo() {
    doms.asdie.nickname.innerText = user.nickname;
    doms.asdie.loginId.innerText = user.loginId;
  }

  //根据消息对象添加到页面中
  function addChat(chatInfo) {
    const div = $$$("div");
    div.classList.add("chat-item");
    if (chatInfo.from) {
      div.classList.add("me");
    }
    const img = $$$("img");
    img.className = "chat-avatar";
    img.src = chatInfo.from ? "./asset/avatar.png" : "./asset/robot-avatar.jpg";
    const content = $$$("div");
    content.className = "chat-content";
    content.innerText = chatInfo.content;
    const data = $$$("div");
    data.className = "chat-date";
    data.innerText = formatDate(chatInfo.createdAt);
    div.appendChild(img);
    div.appendChild(content);
    div.appendChild(data);
    doms.chatContainer.appendChild(div);
  }

  //滚动条滚到到最后
  function scrollBottom() {
    doms.chatContainer.scrollTop = doms.chatContainer.scrollHeight;
  }
  function formatDate(timestamp) {
    const data = new Date(timestamp);
    const year = data.getFullYear();
    const month = (data.getMonth() + 1).toString().padStart(2, "0");
    const day = data.getDay().toString().padEnd(2, "0");
    const hour = data.getHours().toString().padStart(2, "0");
    const minute = data.getMinutes().toString().padStart(2, "0");
    const second = data.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
  async function sendChat() {
    const content = doms.txtMsg.value.trim();
    if (!content) {
      return;
    }
    addChat({
      from: user.loginId,
      to: null,
      createdAt: Date.now(),
      content,
    });
    doms.txtMsg.value = "";
    scrollBottom();
    const resp = await API.sendChat(content);
    addChat({
      form: null,
      to: user.loginId,
      ...resp.data,
    });
    scrollBottom();
  }
  window.sendchat = sendChat;

  // 退出登录
  doms.close.onclick = function () {
    API.loginOut();
    location.href = "./login.html"; // 跳转到登录页
  };
})();
