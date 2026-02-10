"""
My Tool 测试
"""
import pytest
from my_tool import my_tool_function


class TestMyTool:
    """My Tool 测试类"""
    
    @pytest.mark.asyncio
    async def test_basic_functionality(self):
        """测试基本功能"""
        result = await my_tool_function(
            input_param="test",
            optional_param=20
        )
        
        assert result["status"] == "success"
        assert result["data"]["processed_input"] == "TEST"
        assert result["data"]["multiplied_value"] == 40
    
    @pytest.mark.asyncio
    async def test_empty_input_param(self):
        """测试空输入参数"""
        result = await my_tool_function(
            input_param=""
        )
        
        assert result["status"] == "error"
        assert result["error_code"] == "INVALID_PARAM"
    
    @pytest.mark.asyncio
    async def test_param_out_of_range(self):
        """测试参数超出范围"""
        result = await my_tool_function(
            input_param="test",
            optional_param=200
        )
        
        assert result["status"] == "error"
        assert result["error_code"] == "PARAM_OUT_OF_RANGE"
    
    @pytest.mark.asyncio
    async def test_with_array_param(self):
        """测试数组参数"""
        result = await my_tool_function(
            input_param="test",
            array_param=["item1", "item2", "item3"]
        )
        
        assert result["status"] == "success"
        assert result["data"]["items_count"] == 3
    
    @pytest.mark.asyncio
    async def test_with_filter(self):
        """测试过滤条件"""
        result = await my_tool_function(
            input_param="test",
            filter={"field_name": "status", "operator": "eq", "value": "active"}
        )
        
        assert result["status"] == "success"
        assert result["data"]["filter_applied"] is True
