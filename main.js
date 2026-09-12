// main.js 翼起助农 三端订单模拟器 + AI悬浮球智能体
const toastDom = document.getElementById('toast');
// 全局订单数组
let orderList = [];
// 页面切换按钮
const simBtns = document.querySelectorAll('.sim-btn');
const pages = {
    userPage: document.getElementById('userPage'),
    pilotPage: document.getElementById('pilotPage'),
    adminPage: document.getElementById('adminPage')
};
const simRoleText = document.getElementById('simRoleText');
simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 清除按钮激活状态
        simBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetKey = btn.dataset.target;
        // 隐藏所有页面
        Object.values(pages).forEach(p => p.classList.add('hidden'));
        pages[targetKey].classList.remove('hidden');
        // 修改身份文字
        if(targetKey === 'userPage'){
            simRoleText.innerText = "当前身份：农户用户端";
        }else if(targetKey === 'pilotPage'){
            simRoleText.innerText = "当前身份：飞手接单端";
        }else if(targetKey === 'adminPage'){
            simRoleText.innerText = "当前身份：管理控制台";
        }
    })
})

// 弹窗提示
function showToast(msg){
    toastDom.textContent = msg;
    toastDom.style.opacity = 1;
    setTimeout(()=>{
        toastDom.style.opacity = 0;
    },2000)
}

// 提交订单
const submitBtn = document.getElementById('submitOrderBtn');
submitBtn.addEventListener('click',()=>{
    const goodsType = document.getElementById('goodsType').value;
    const sendAddr = document.getElementById('sendAddr').value.trim();
    const recvAddr = document.getElementById('recvAddr').value.trim();
    const dist = Number(document.getElementById('dist').value);
    const weight = Number(document.getElementById('weight').value);
    if(!sendAddr || !recvAddr || isNaN(dist) || isNaN(weight) || dist <=0 || weight <=0){
        showToast("请填写完整有效的订单信息！");
        return;
    }
    // 简单计价公式
    const price = Math.round(weight * 2.8 + dist * 4.2);
    const orderId = "ORD" + Date.now();
    const newOrder = {
        id: orderId,
        goods: goodsType,
        from: sendAddr,
        to: recvAddr,
        distance: dist,
        weight: weight,
        price: price,
        status: "待接单", //待接单/已接单/已完成
        pilotName: ""
    };
    orderList.push(newOrder);
    renderAll();
    showToast(`订单${orderId}提交成功，等待飞手接单！`);
})

// 渲染全部三个页面数据
function renderAll(){
    renderUserOrder();
    renderPilotOrder();
    renderAdminOrder();
    renderStatData();
}

// 农户端 - 我的订单
function renderUserOrder(){
    const wrap = document.getElementById('userMyOrderList');
    wrap.innerHTML = "";
    if(orderList.length === 0){
        wrap.innerHTML = "<p style='padding:10px;color:#777'>暂无订单</p>";
        return;
    }
    orderList.forEach(item=>{
        const div = document.createElement('div');
        div.style.border = "1px solid #eee";
        div.style.padding = "12px";
        div.style.borderRadius = "8px";
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <div><b>${item.id}</b></div>
            <div>物品：${item.goods}</div>
            <div>${item.from} → ${item.to}</div>
            <div>重量:${item.weight}kg｜距离:${item.distance}km</div>
            <div>费用：¥${item.price}</div>
            <div>状态：${item.status}</div>
        `;
        wrap.appendChild(div);
    })
}

// 飞手端订单大厅
function renderPilotOrder(){
    const wrap = document.getElementById('pilotOrderList');
    wrap.innerHTML = "";
    const waitOrders = orderList.filter(o=>o.status === "待接单");
    if(waitOrders.length ===0){
        wrap.innerHTML = "<p style='padding:10px;color:#777'>暂无待接单订单</p>";
        return;
    }
    waitOrders.forEach(item=>{
        const card = document.createElement('div');
        card.className = "sim-card";
        card.innerHTML = `
            <div><b>${item.id}</b></div>
            <div>物品：${item.goods}</div>
            <div>${item.from}→${item.to}</div>
            <div>${item.weight}kg｜${item.distance}km</div>
            <div>报酬：¥${item.price}</div>
            <button class="take-order-btn" data-oid="${item.id}" style="margin-top:8px;padding:6px 10px;background:#258b52;color:#fff;border-radius:6px">接单</button>
        `;
        wrap.appendChild(card);
    })
    // 绑定接单按钮
    document.querySelectorAll('.take-order-btn').forEach(btn=>{
        btn.onclick = ()=>{
            const oid = btn.dataset.oid;
            const target = orderList.find(o=>o.id === oid);
            if(target){
                target.status = "已接单";
                target.pilotName = "持证飞手";
                renderAll();
                showToast("接单成功！");
            }
        }
    })
}

// 管理后台订单表格
function renderAdminOrder(){
    const tbody = document.getElementById('adminOrderList');
    tbody.innerHTML = "";
    if(orderList.length === 0){
        tbody.innerHTML = `<tr><td colspan="6">暂无订单数据</td></tr>`;
        return;
    }
    orderList.forEach(item=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.goods}</td>
            <td>${item.from}</td>
            <td>${item.to}</td>
            <td>¥${item.price}</td>
            <td>${item.status}</td>
        `;
        tbody.appendChild(tr);
    })
}

// 统计数据渲染
function renderStatData(){
    const todayTotal = orderList.length;
    const totalIncome = orderList.reduce((sum,item)=> sum + item.price,0);
    const waitNum = orderList.filter(o=>o.status === "待接单").length;
    document.getElementById('pilotTodayOrder').innerText = todayTotal;
    document.getElementById('pilotTodayIncome').innerText = totalIncome;
    document.getElementById('waitOrderNum').innerText = waitNum;
    document.getElementById('adminTodayOrder').innerText = todayTotal;
    document.getElementById('adminTodayIncome').innerText = totalIncome;
}

// 数字滚动动画（市场板块数字）
function animateNumber(){
    const numItems = document.querySelectorAll('.num');
    numItems.forEach(item=>{
        const targetText = item.dataset.num;
        // 包含横杠的直接显示文字，纯数字做动画
        if(targetText.includes('-')){
            item.innerText = targetText;
            return;
        }
        const target = parseFloat(targetText);
        let count = 0;
        const duration = 1200;
        const stepTime = 30;
        const increment = target/(duration/stepTime);
        const timer = setInterval(()=>{
            count += increment;
            if(count >= target){
                item.innerText = target;
                clearInterval(timer);
            }else{
                item.innerText = count.toFixed(1);
            }
        },stepTime)
    })
}

// 监听滚动，进入视口才触发数字动画
const numSection = document.querySelector('#data');
let animatedFlag = false;
window.addEventListener('scroll',()=>{
    if(animatedFlag) return;
    const rect = numSection.getBoundingClientRect();
    if(rect.top < window.innerHeight * 0.7){
        animateNumber();
        animatedFlag = true;
    }
})

// ===================== AI悬浮球智能体代码开始 =====================
document.addEventListener("DOMContentLoaded",function(){
    const aiBall = document.getElementById("aiBall");
    const aiPanel = document.getElementById("aiPanel");
    const aiInput = document.getElementById("aiInput");
    const chatHistory = document.getElementById("chatHistory");
    const sendBtn = document.getElementById("sendChatBtn");
    const transItem = document.getElementById("transItem");

    // 圆球拖拽
    const wrap = document.querySelector(".ai-float-wrap");
    let isDrag = false;
    let startX,startY,originX,originY;
    aiBall.addEventListener("mousedown",(e)=>{
        isDrag = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = wrap.getBoundingClientRect();
        originX = rect.left;
        originY = rect.top;
        wrap.style.transition = "none";
    })
    document.addEventListener("mousemove",(e)=>{
        if(!isDrag) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        wrap.style.left = originX + dx + "px";
        wrap.style.top = originY + dy + "px";
    })
    document.addEventListener("mouseup",()=>{
        isDrag = false;
        wrap.style.transition = "0.2s";
    })

    // 点击圆球打开/关闭面板
    aiBall.onclick = function(){
        aiPanel.classList.toggle("show");
    }

    // ========== 请求Cloudflare Worker中转豆包ARK，域名：api.wuyuwsl.asia ==========
    const API_URL = "https://api.wuyuwsl.asia";

    async function sendMessageToAI(userText) {
      try{
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userText
          })
        });
        if(!res.ok) throw new Error("接口请求失败");
        const json = await res.json();
        return json.choices[0].message.content;
      }catch(err){
        return "接口请求失败：" + err.message;
      }
    }

    // 消息渲染，使用css类，和style.css配套（区分用户/AI气泡背景色）
    function addChatItem(type, text){
        const div = document.createElement('div');
        if(type === "user"){
            div.className = "msg-user";
        }else{
            div.className = "msg-ai";
        }
        div.textContent = text;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 发送按钮点击
    sendBtn.addEventListener('click', async function(){
        const msg = aiInput.value.trim();
        if(!msg) return;
        addChatItem("user", msg);
        aiInput.value = "";
        const aiReply = await sendMessageToAI(msg);
        addChatItem("ai", aiReply);
    })
    // 回车发送
    aiInput.addEventListener('keydown', async function(e){
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault();
            sendBtn.click();
        }
    })

    // 选中文字翻译，复用worker接口
    transItem.addEventListener("click",async ()=>{
        const sel = window.getSelection().toString().trim();
        if(!sel) return alert("请先选中页面上文字");
        addChatItem("user",`请翻译这段文字：${sel}`);
        const aiReply = await sendMessageToAI(`请翻译这段文字：${sel}`);
        addChatItem("ai", aiReply);
    })
})
// ===================== AI悬浮球代码结束 =====================

// 页面加载完成初始化渲染
window.onload = function(){
    renderAll();
}
