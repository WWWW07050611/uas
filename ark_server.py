from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 开关：Mock模拟模式开启，不调用豆包API
MOCK_MODE = True

@app.route("/api/chat", methods=["GET", "POST"])
def chat():
    # 浏览器GET访问，返回测试文字，不再405
    if request.method == "GET":
        return "✅ API服务正常，请用POST提交消息", 200

    # POST请求，前端网页发消息走这里
    data = request.get_json()
    user_text = data.get("user_text", "")
    reply = ""

    # 扩充问答关键词（翼博云添业务）
    if "接单" in user_text:
        reply = "你在订单大厅找到待接单订单，点击绿色接单按钮，接单成功订单就进入【我的接单】列表，完成配送后点击完成配送。"
    elif "订单" in user_text:
        reply = "农户发布订单后，会出现在订单大厅，等待飞手接单。农户填写物品、出发地目的地、重量距离，系统自动计算运费。"
    elif "无人机" in user_text or "配送" in user_text:
        reply = "本项目是川南丘陵山区无人机乡村物流，无人机负责乡村之间物资运输，降低山区配送难度。"
    elif "运费" in user_text or "价格" in user_text:
        reply = "运费会根据距离、货物重量自动计算，距离越远、重量越大，运费越高。"
    else:
        reply = "翼博云添AI助手，可以咨询无人机配送订单相关问题，也可以回答各类日常问题。"
    return jsonify({"result": reply})


@app.route("/api/translate", methods=["GET", "POST"])
def translate():
    if request.method == "GET":
        return "✅翻译接口就绪，请POST提交文本",200
    data = request.get_json()
    text = data.get("text","")
    return jsonify({"result":f"英文翻译：{text}"})


if __name__ == '__main__':
    app.run()
