"""
My Agent 测试
"""
import pytest


class TestMyAgent:
    """My Agent 测试类"""
    
    def test_agent_config_exists(self):
        """测试 Agent 配置文件存在"""
        import os
        config_path = os.path.join(
            os.path.dirname(__file__),
            "../src/my_agent/my_agent.yaml"
        )
        assert os.path.exists(config_path)
    
    def test_system_prompt_exists(self):
        """测试 System Prompt 文件存在"""
        import os
        prompt_path = os.path.join(
            os.path.dirname(__file__),
            "../src/my_agent/my_agent.md"
        )
        assert os.path.exists(prompt_path)
