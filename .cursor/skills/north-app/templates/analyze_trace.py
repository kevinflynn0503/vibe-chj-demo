#!/usr/bin/env python3
"""
分析 Langfuse Trace 日志

使用方法：
    python3 analyze_trace.py <trace_file.json>
    python3 analyze_trace.py 日志/trace-xxx.json
"""

import json
import sys
from pathlib import Path


def analyze_trace(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    trace = data.get("trace", data)
    observations = data.get("observations", [])

    print("=" * 60)
    print("📊 TRACE 分析报告")
    print("=" * 60)

    # 基本信息
    print(f"\n📌 基本信息")
    print(f"   Trace ID: {trace.get('id', 'N/A')}")
    print(f"   名称: {trace.get('name', 'N/A')}")
    print(f"   时间: {trace.get('timestamp', 'N/A')}")
    print(f"   耗时: {trace.get('latency', 0):.2f} 秒")
    print(f"   状态: {'❌ 失败' if trace.get('level') == 'ERROR' else '✅ 成功'}")

    if trace.get("statusMessage"):
        msg = trace.get("statusMessage", "")
        print(f"   错误: {msg[:100]}..." if len(msg) > 100 else f"   错误: {msg}")

    # 统计
    print(f"\n📈 Observations 统计")
    print(f"   总数: {len(observations)}")

    spans = [o for o in observations if o.get("type") == "SPAN"]
    generations = [o for o in observations if o.get("type") == "GENERATION"]
    errors = [o for o in observations if o.get("level") == "ERROR"]

    print(f"   SPAN: {len(spans)}")
    print(f"   GENERATION (LLM): {len(generations)}")
    print(f"   错误: {len(errors)}")

    # Token
    total_input = sum(o.get("inputUsage", 0) or 0 for o in generations)
    total_output = sum(o.get("outputUsage", 0) or 0 for o in generations)

    print(f"\n💰 Token 用量")
    print(f"   输入: {total_input:,}")
    print(f"   输出: {total_output:,}")
    print(f"   总计: {total_input + total_output:,}")

    # 工具调用
    tool_calls = [o for o in spans if "tool" in o.get("name", "").lower()]
    if tool_calls:
        print(f"\n🔧 工具调用 ({len(tool_calls)} 次)")
        for tool in tool_calls[:10]:
            name = tool.get("name", "Unknown")
            latency = tool.get("latency", 0)
            level = "❌" if tool.get("level") == "ERROR" else "✓"
            print(f"   {level} {name}: {latency}ms")

    # 错误
    if errors:
        print(f"\n❌ 错误详情 ({len(errors)} 个)")
        for err in errors[:5]:
            print(f"\n   [{err.get('type', '?')}] {err.get('name', 'Unknown')}")
            if err.get("statusMessage"):
                msg = err.get("statusMessage", "")
                print(f"   {msg[:100]}..." if len(msg) > 100 else f"   {msg}")

    # 时间线
    print(f"\n⏱️  执行时间线 (前 10 项)")
    sorted_obs = sorted(observations, key=lambda x: x.get("startTime", ""))[:10]

    for obs in sorted_obs:
        start = obs.get("startTime", "")[:19]
        name = obs.get("name", "Unknown")[:35]
        latency = obs.get("latency", 0)
        level = "❌" if obs.get("level") == "ERROR" else "✓"
        obs_type = obs.get("type", "?")[0]

        print(f"   {start} | {level} [{obs_type}] {name:<35} | {latency}ms")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python3 analyze_trace.py <trace_file.json>")
        sys.exit(1)

    file_path = sys.argv[1]
    if not Path(file_path).exists():
        print(f"❌ 文件不存在: {file_path}")
        sys.exit(1)

    analyze_trace(file_path)
