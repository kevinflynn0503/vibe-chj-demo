#!/usr/bin/env python3
"""
下载 Langfuse Trace 日志

使用方法：
1. 修改 TRACE_ID 变量
2. 运行: python3 download_trace.py

或者直接运行一行命令（在 troubleshooting.md 中有示例）
"""

import json
import base64
import requests
import urllib3
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ===== Langfuse 配置 =====
PUBLIC_KEY = "pk-lf-91bb63d9-9af6-441d-b4d6-d7a81a6cc7dc"
SECRET_KEY = "sk-lf-2829cd64-b673-4380-8e57-14b90d6daa44"
HOST = "https://langfuse.xiaobei.top"

# ===== 要下载的 Trace ID =====
TRACE_ID = "替换为你的trace_id"  # ⚠️ 修改这里

# ===== 输出目录 =====
OUTPUT_DIR = Path("日志")


def main():
    auth_base64 = base64.b64encode(
        f"{PUBLIC_KEY}:{SECRET_KEY}".encode()
    ).decode()
    headers = {"Authorization": f"Basic {auth_base64}"}

    OUTPUT_DIR.mkdir(exist_ok=True)

    print(f"🔍 开始下载 Trace: {TRACE_ID}")

    try:
        url = f"{HOST}/api/public/traces/{TRACE_ID}"
        response = requests.get(url, headers=headers, timeout=60, verify=False)

        if response.status_code == 200:
            trace = response.json()
            trace_file = OUTPUT_DIR / f"trace-{TRACE_ID}.json"
            
            with open(trace_file, "w", encoding="utf-8") as f:
                json.dump(trace, f, ensure_ascii=False, indent=2)

            obs_count = len(trace.get("observations", []))
            print(f"✅ 下载成功！")
            print(f"📁 保存到: {trace_file}")
            print(f"📊 Observations: {obs_count}")

            # 基本信息
            if "trace" in trace:
                t = trace["trace"]
                print(f"\n📌 Trace 信息:")
                print(f"   名称: {t.get('name', 'N/A')}")
                print(f"   耗时: {t.get('latency', 0):.2f}s")
                level = t.get("level", "DEFAULT")
                print(f"   状态: {'❌ 失败' if level == 'ERROR' else '✅ 成功'}")
                if t.get("statusMessage"):
                    print(f"   错误: {t.get('statusMessage')[:100]}...")
        else:
            print(f"❌ HTTP {response.status_code}: {response.text[:200]}")

    except Exception as e:
        print(f"❌ 下载失败: {e}")


if __name__ == "__main__":
    main()
