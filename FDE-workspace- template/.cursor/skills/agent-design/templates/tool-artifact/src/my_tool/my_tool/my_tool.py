"""
My Tool - 工具功能描述

功能说明：
1. 主要功能1
2. 主要功能2

注意事项：
- 注意点1
- 注意点2
"""
from typing import Optional, List, Dict, Any
from nexau.archs.tool import ToolContext


async def my_tool_function(
    input_param: str,
    optional_param: int = 10,
    enum_param: str = "option1",
    array_param: Optional[List[str]] = None,
    filter: Optional[Dict[str, Any]] = None,
    context: ToolContext = None
) -> dict:
    """
    工具函数实现。
    
    功能说明：
    1. 处理输入参数
    2. 执行业务逻辑
    3. 返回结构化结果
    
    Args:
        input_param: 必填输入参数
        optional_param: 可选整数参数，默认10
        enum_param: 枚举参数，可选 option1/option2/option3
        array_param: 数组参数
        filter: 过滤条件对象
        context: 工具上下文（自动注入）
        
    Returns:
        dict: 包含 status 和 data 的结果字典
        
    Raises:
        ValueError: 参数验证失败时抛出
    """
    try:
        # ===== 参数验证 =====
        if not input_param:
            return {
                "status": "error",
                "error": "input_param cannot be empty",
                "error_code": "INVALID_PARAM"
            }
        
        if optional_param < 1 or optional_param > 100:
            return {
                "status": "error", 
                "error": "optional_param must be between 1 and 100",
                "error_code": "PARAM_OUT_OF_RANGE"
            }
        
        # ===== 业务逻辑 =====
        result = _process_data(
            input_param=input_param,
            optional_param=optional_param,
            enum_param=enum_param,
            array_param=array_param or [],
            filter=filter
        )
        
        # ===== 返回结果 =====
        return {
            "status": "success",
            "data": result,
            "metadata": {
                "input_param": input_param,
                "optional_param": optional_param,
                "enum_param": enum_param
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_code": "INTERNAL_ERROR"
        }


def _process_data(
    input_param: str,
    optional_param: int,
    enum_param: str,
    array_param: List[str],
    filter: Optional[Dict[str, Any]]
) -> dict:
    """
    内部处理函数。
    
    Args:
        input_param: 输入参数
        optional_param: 可选参数
        enum_param: 枚举参数
        array_param: 数组参数
        filter: 过滤条件
        
    Returns:
        dict: 处理结果
    """
    # TODO: 实现具体业务逻辑
    processed_result = {
        "processed_input": input_param.upper(),
        "multiplied_value": optional_param * 2,
        "selected_option": enum_param,
        "items_count": len(array_param),
        "filter_applied": filter is not None
    }
    
    return processed_result
