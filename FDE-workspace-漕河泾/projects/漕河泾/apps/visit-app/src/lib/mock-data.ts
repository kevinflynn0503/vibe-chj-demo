/**
 * 统一 Mock 数据 — 合并三个场景
 */

import type {
  Enterprise, VisitRecord, BackgroundReport, VisitDemand, VisitStats,
  PolicyAssessment, PolicyStats, ProjectManagerProgress,
  IncubatorEnterprise, ActivityReport, ChatMessage, MatchResult,
} from './schema';

// ═══════════════════════════════════════════
// 企业数据（公共）
// ═══════════════════════════════════════════

export const mockEnterprises: Enterprise[] = [
  { id: 'ent-001', name: '上海强生医疗器械有限公司', short_name: '强生医疗', unified_code: '91310000XXXXXXXX01', registered_address: '上海市徐汇区漕河泾开发区田林路XXX号', office_address: '上海市徐汇区漕河泾开发区田林路XXX号', legal_person: '张明', established_date: '2005-03-15', registered_capital: '5000万美元', industry: '生物医药', industry_sub: '医疗器械', industry_tags: ['医疗器械','外科机器人','高值耗材','跨国企业'], supply_chain_position: '终端制造商', development_stage: '成熟期', employee_count: 1200, description: '强生医疗器械中国区研发中心', source: '企业数据库', is_in_park: true, is_incubated: false, last_visited_at: '2026-01-20', ai_summary: '强生医疗是漕河泾核心大企业，年营收超10亿。近期重点布局外科机器人和数字化手术平台，与园区AI生态有较强合作潜力。', created_at: '2024-06-01T00:00:00Z', updated_at: '2026-01-20T00:00:00Z' },
  { id: 'ent-002', name: '上海蔚来汽车科技有限公司', short_name: '蔚来汽车', unified_code: '91310000XXXXXXXX02', registered_address: '上海市嘉定区安驰路XXX号', office_address: '上海市徐汇区漕河泾开发区宜山路XXX号', legal_person: '李斌', established_date: '2014-11-25', registered_capital: '1亿元', industry: '汽车制造', industry_sub: '新能源汽车', industry_tags: ['新能源汽车','智能驾驶','自动驾驶'], supply_chain_position: '整车厂', development_stage: '成长期', employee_count: 3000, description: '蔚来汽车漕河泾研发中心', source: '企业数据库', is_in_park: true, is_incubated: false, last_visited_at: '2026-01-15', ai_summary: '蔚来是漕河泾标杆新能源企业。供应链对接机会丰富。', created_at: '2024-06-01T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: 'ent-003', name: '上海北坡智能科技有限公司', short_name: '北坡科技', unified_code: '91310000XXXXXXXX03', registered_address: '上海市徐汇区漕河泾开发区A6栋501', office_address: '上海市徐汇区漕河泾开发区A6栋501', legal_person: '王磊', established_date: '2024-08-01', registered_capital: '100万元', industry: '人工智能', industry_sub: 'AI应用', industry_tags: ['人工智能','Agent','大模型应用','初创企业'], supply_chain_position: '应用层', development_stage: '初创期', employee_count: 6, description: 'AI Agent开发团队', source: '走访录入', is_in_park: true, is_incubated: true, last_visited_at: '2026-02-03', ai_summary: '初创AI公司，正在为漕河泾开发智能驾驶舱系统。', created_at: '2024-08-01T00:00:00Z', updated_at: '2026-02-03T00:00:00Z' },
  { id: 'ent-004', name: '上海仪电集团有限公司', short_name: '仪电集团', unified_code: '91310000XXXXXXXX04', registered_address: '上海市徐汇区漕河泾开发区桂林路XXX号', office_address: '上海市徐汇区漕河泾开发区桂林路XXX号', legal_person: '陈刚', established_date: '1990-05-10', registered_capital: '50亿元', industry: '电子信息', industry_sub: '系统集成', industry_tags: ['系统集成','智慧城市','物联网','国企'], supply_chain_position: '方案集成商', development_stage: '成熟期', employee_count: 8000, description: '城市数字化主力军', source: '企业数据库', is_in_park: true, is_incubated: false, last_visited_at: '2026-01-10', ai_summary: '仪电是园区最大的国企租户，有大量数字化项目采购需求。', created_at: '2024-06-01T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  { id: 'ent-005', name: '上海芯视科技有限公司', short_name: '芯视科技', unified_code: '91310000XXXXXXXX05', registered_address: '上海市徐汇区漕河泾开发区A6栋802', office_address: '上海市徐汇区漕河泾开发区A6栋802', legal_person: '赵翔', established_date: '2023-06-15', registered_capital: '500万元', industry: '集成电路', industry_sub: '视觉传感器', industry_tags: ['集成电路','视觉传感器','AI芯片','初创企业'], supply_chain_position: '核心器件供应商', development_stage: '初创期', employee_count: 15, description: 'AI视觉传感器芯片设计', source: '孵化器', is_in_park: true, is_incubated: true, last_visited_at: '2026-02-01', ai_summary: '奇绩创坛投资的IC设计团队，正在做A轮融资。', created_at: '2023-06-15T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' },
];

// ═══ 走访记录 ═══

export const mockVisitRecords: VisitRecord[] = [
  { id: 'visit-001', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', visitor_name: '蔡建东', visitor_department: '产促部', visit_date: '2026-01-20', visit_type: 'investment', counterpart_name: '周敏', counterpart_title: 'CEO', key_findings: ['强生计划加大外科机器人研发投入，2026年目标营收12亿','对漕河泾AI生态中心的算力平台表现出浓厚兴趣','希望漕河泾协助对接生物医药上下游企业'], demands: ['希望获得算力平台的使用权限','需要对接生物医药产业链的上游原材料企业'], follow_up: '下周安排园发中心的同事一起去，介绍AI算力平台', is_confirmed: true, key_question_coverage: { track_questions: { covered: 3, total: 3, missed: [] }, policy_questions: { covered: 1, total: 2, missed: ['研发费用占比'] } }, created_at: '2026-01-20T16:00:00Z' },
  { id: 'visit-002', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', visitor_name: '刘明新', visitor_department: '科创中心', visit_date: '2026-01-25', visit_type: 'innovation', counterpart_name: '李华', counterpart_title: '研发总监', key_findings: ['强生有6项发明专利正在申请中','研发团队占比约30%，研发费用占收入8%','对申报高新技术企业有兴趣'], demands: ['需要高新技术企业申报的指导服务'], follow_up: '已收集到研发费用占比信息，推送给政策服务团队', is_confirmed: true, key_question_coverage: { track_questions: { covered: 2, total: 3, missed: ['产品市场份额'] }, policy_questions: { covered: 2, total: 2, missed: [] } }, created_at: '2026-01-25T14:00:00Z' },
  { id: 'visit-003', enterprise_id: 'ent-002', enterprise_name: '上海蔚来汽车科技有限公司', visitor_name: '王龙', visitor_department: '产促部', visit_date: '2026-01-15', visit_type: 'investment', counterpart_name: '张伟', counterpart_title: '供应链总监', key_findings: ['蔚来2026年计划将漕河泾研发中心扩展到500人','需要大量传感器和AI芯片的本地化供应商','愿意拿出3个项目作为孵化企业的试单机会'], demands: ['寻找本地化的传感器和AI芯片供应商','希望了解漕河泾人才公寓的情况'], follow_up: '把蔚来的供应链需求同步给孵化器赵婧总', is_confirmed: true, key_question_coverage: { track_questions: { covered: 3, total: 3, missed: [] } }, created_at: '2026-01-15T10:00:00Z' },
  { id: 'visit-004', enterprise_id: 'ent-005', enterprise_name: '上海芯视科技有限公司', visitor_name: '公台红', visitor_department: '孵化器', visit_date: '2026-02-01', visit_type: 'incubator', counterpart_name: '赵翔', counterpart_title: 'CEO', key_findings: ['芯视A轮融资进展顺利，预计3月close','新一代传感器芯片已完成流片，待量产','正在积极寻找整车厂作为首批客户'], demands: ['希望漕河泾帮助对接蔚来和其他整车厂'], follow_up: '匹配蔚来的传感器需求', is_confirmed: false, key_question_coverage: { track_questions: { covered: 2, total: 3, missed: ['竞品分析'] } }, created_at: '2026-02-01T15:00:00Z' },
];

// ═══ 背调报告 ═══

export const mockBackgroundReports: BackgroundReport[] = [
  {
    id: 'report-001', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', created_by: '蔡建东',
    report_content: {
      basic_info: { title: '一、工商信息', content: '**企业名称**：上海强生医疗器械有限公司\n**统一社会信用代码**：91310000XXXXXXXX01\n**成立日期**：2005年3月15日\n**注册资本**：5000万美元\n**法定代表人**：张明', source: '企业数据库' },
      equity: { title: '二、股权情况', content: '**控股股东**：Johnson & Johnson International（100%持股）\n**实际控制人**：强生集团（美国新泽西）\n**近一年股权变化**：无重大变化', source: '企查查' },
      funding: { title: '三、融资情况', content: '作为强生集团全资子公司，资金来源主要为母公司注资。\n2025年获母公司增资2000万美元用于扩建研发中心。', source: '企查查+新闻' },
      team: { title: '四、团队情况', content: '**CEO 周敏**：曾任美敦力中国区副总裁，20年医疗器械行业经验。\n**研发总监 李华**：MIT博士后，主导外科机器人平台研发，持有12项国际专利。', source: 'deep research' },
      products: { title: '五、产品情况', content: '1. MONARCH外科手术机器人平台——已获NMPA注册证\n2. ECHELON系列高值耗材——微创手术吻合器\n3. 数字化手术规划系统——基于AI的术前模拟', source: '企业官网+新闻' },
      dynamics: { title: '六、行业/企业动态', content: '- 2026.01：周敏在JPM大会上宣布加大中国研发投入\n- 2025.12：获批第3代MONARCH系统的NMPA注册\n- 2025.11：与瑞金医院签署临床合作协议', source: 'deep research' },
      supply_chain: { title: '七、产业链分析', content: '**上游供应商**：精密电机（日本电产）、光学镜头（舜宇光学）、传感器（待国产化替代）\n**下游客户**：三甲医院\n**国产替代机会**：传感器和部分精密零件有国产化替代空间', source: 'deep research+走访' },
      potential_needs: { title: '八、潜在需求分析', content: '**政策需求**：符合高新技术企业认定条件，建议推动申报\n**服务需求**：对AI算力平台有明确需求\n**产业链需求**：寻找传感器国产化替代供应商', source: '走访记录综合' },
    },
    communication_checklist: {
      talking_points: ['漕河泾AI生态中心的算力平台介绍，可提供GPU集群试用','园区内有3家传感器相关企业可对接','颠覆性技术项目申报——强生的手术机器人符合条件','园区生物医药产业链服务网络介绍'],
      must_ask_questions: ['[赛道-生物医药] 目前的医疗器械注册证有多少个？','[赛道-生物医药] 2025年研发投入金额和占比？','[赛道-生物医药] 近三年的专利申请和授权情况？','[政策] 是否了解高新技术企业认定政策？','[政策] 研发人员占总员工的比例？'],
      key_insights: ['周敏在JPM大会宣布加大中国投入——时机好，可主动约高层会面','研发费用占比8%、多项发明专利——高概率符合高新认定条件','传感器国产化需求——可匹配A6孵化企业芯视科技'],
    },
    feishu_doc_url: 'https://xxx.feishu.cn/docx/mock-report-001', status: 'published', created_at: '2026-01-19T09:00:00Z',
  },
];

// ═══ 需求 ═══

export const mockDemands: VisitDemand[] = [
  { id: 'demand-001', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', visit_record_id: 'visit-001', demand_content: '希望获得漕河泾AI算力平台的使用权限', demand_type: 'service', assigned_department: '园区发展中心', status: 'processing', created_at: '2026-01-20T16:30:00Z' },
  { id: 'demand-002', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', visit_record_id: 'visit-001', demand_content: '对接生物医药产业链上游原材料企业', demand_type: 'cooperation', assigned_department: '产促部', status: 'pending', created_at: '2026-01-20T16:30:00Z' },
  { id: 'demand-003', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', visit_record_id: 'visit-002', demand_content: '需要高新技术企业申报的指导服务', demand_type: 'policy', assigned_department: '科创中心', status: 'pending', created_at: '2026-01-25T14:30:00Z' },
  { id: 'demand-004', enterprise_id: 'ent-002', enterprise_name: '上海蔚来汽车科技有限公司', visit_record_id: 'visit-003', demand_content: '寻找本地化的传感器和AI芯片供应商', demand_type: 'cooperation', assigned_department: '孵化器', status: 'processing', created_at: '2026-01-15T10:30:00Z' },
];

// ═══ 政策评估 ═══

export const mockAssessments: PolicyAssessment[] = [
  { id: 'assess-001', enterprise_id: 'ent-001', enterprise_name: '上海强生医疗器械有限公司', policy_type: '高新技术企业', screening_result: 'pass', screening_details: [ { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2005年成立，21年', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' }, { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '12项发明专利+6项实用新型', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' }, { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '生物医药-医疗器械', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' }, { rule_name: '研发费用占比', rule_type: 'hard', result: 'pass', enterprise_value: '约8%', required_value: '>2亿收入→≥3%', data_source: '走访记录', confidence: 'medium', note: '数据来自2026.01.25科创走访' }, { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low', note: '需走访时确认' }, { rule_name: '科技人员占比', rule_type: 'hard', result: 'pass', enterprise_value: '约30%', required_value: '≥10%', data_source: '走访记录', confidence: 'medium' } ], grade: 'A', grade_score: 85, touch_status: 'willing', assigned_to: '薛坤', final_result: 'pending', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-07T14:00:00Z' },
  { id: 'assess-002', enterprise_id: 'ent-005', enterprise_name: '上海芯视科技有限公司', policy_type: '高新技术企业', screening_result: 'pass', screening_details: [ { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2023年成立，3年', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' }, { rule_name: '知识产权', rule_type: 'hard', result: 'pending', enterprise_value: '正在申请中', required_value: '≥1项一类', data_source: 'deep research', confidence: 'low', note: '需确认专利授权情况' }, { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '电子信息-集成电路', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' }, { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '约60%（置信度低）', required_value: '<5000万→≥5%', data_source: '走访记录', confidence: 'low' }, { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' }, { rule_name: '科技人员占比', rule_type: 'hard', result: 'pass', enterprise_value: '约80%', required_value: '≥10%', data_source: '走访记录', confidence: 'medium' } ], grade: 'B', grade_score: 68, touch_status: 'assigned', assigned_to: '项目经理A', final_result: 'pending', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
  { id: 'assess-003', enterprise_id: 'ent-002', enterprise_name: '上海蔚来汽车科技有限公司', policy_type: '高新技术企业', screening_result: 'pass', screening_details: [ { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '2014年成立', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' }, { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '200+项专利', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' }, { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '新能源汽车-智能驾驶', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' }, { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '>2亿→≥3%', data_source: '', confidence: 'low' }, { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' }, { rule_name: '科技人员占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥10%', data_source: '', confidence: 'low' } ], grade: 'B', grade_score: 62, touch_status: 'pending', final_result: 'pending', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
  { id: 'assess-004', enterprise_id: 'ent-004', enterprise_name: '上海仪电集团有限公司', policy_type: '高新技术企业', screening_result: 'pass', screening_details: [ { rule_name: '成立时间', rule_type: 'hard', result: 'pass', enterprise_value: '1990年成立', required_value: '≥1年', data_source: '企业数据库', confidence: 'high' }, { rule_name: '知识产权', rule_type: 'hard', result: 'pass', enterprise_value: '500+项专利', required_value: '≥1项一类', data_source: '企查查', confidence: 'high' }, { rule_name: '技术领域', rule_type: 'hard', result: 'pass', enterprise_value: '电子信息-系统集成', required_value: '8大领域之一', data_source: '企业数据库', confidence: 'high' }, { rule_name: '研发费用占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '>2亿→≥3%', data_source: '', confidence: 'low' }, { rule_name: '高新收入占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥60%', data_source: '', confidence: 'low' }, { rule_name: '科技人员占比', rule_type: 'hard', result: 'pending', enterprise_value: '未获取', required_value: '≥10%', data_source: '', confidence: 'low' } ], grade: 'C', grade_score: 55, touch_status: 'pending', final_result: 'pending', created_at: '2026-02-05T10:00:00Z', updated_at: '2026-02-05T10:00:00Z' },
];

export const mockPolicyStats: PolicyStats = { total_screened: 326, grade_a: 12, grade_b: 28, grade_c: 45, unqualified: 241, touch_assigned: 35, touch_visited: 18, touch_willing: 8, approved: 0 };
export const mockPMProgress: ProjectManagerProgress[] = [
  { name: '薛坤', assigned: 8, visited: 6, willing: 3, conversion_rate: 0.5 },
  { name: '项目经理A', assigned: 12, visited: 5, willing: 2, conversion_rate: 0.4 },
  { name: '项目经理B', assigned: 10, visited: 4, willing: 2, conversion_rate: 0.5 },
  { name: '项目经理C', assigned: 5, visited: 3, willing: 1, conversion_rate: 0.33 },
];

// ═══ 孵化器 ═══

export const mockIncubatorEnterprises: IncubatorEnterprise[] = [
  { id: 'inc-001', enterprise_id: 'ent-003', name: '北坡科技', products: ['AI Agent平台','企业智能助手'], tech_stack: ['大模型','RAG','Agent框架','Next.js'], target_market: '企业数字化', funding_stage: '天使轮', activity_score: 82, bp_summary: 'AI Agent开发团队，专注企业级智能助手。', employee_count: 6, location: 'A6-501', entered_at: '2024-08', created_at: '2024-08-01T00:00:00Z' },
  { id: 'inc-002', enterprise_id: 'ent-005', name: '芯视科技', products: ['AI视觉传感器芯片','工业视觉模组'], tech_stack: ['IC设计','CMOS传感器','嵌入式AI'], target_market: '工业自动化/智能驾驶', funding_stage: 'Pre-A', activity_score: 91, bp_summary: 'AI视觉传感器芯片设计，新一代芯片已完成流片。', employee_count: 15, location: 'A6-802', entered_at: '2023-06', created_at: '2023-06-15T00:00:00Z' },
  { id: 'inc-003', enterprise_id: 'inc-ent-003', name: '宇和科技', products: ['工业机械臂控制系统','自动化产线方案'], tech_stack: ['运动控制','机器人','PLC编程','ROS'], target_market: '工业制造', funding_stage: 'A轮', activity_score: 88, bp_summary: '工业机械臂控制系统供应商。', employee_count: 22, location: 'A6-803', entered_at: '2023-01', created_at: '2023-01-10T00:00:00Z' },
  { id: 'inc-004', enterprise_id: 'inc-ent-004', name: '智码科技', products: ['工业控制软件','SCADA系统','数字孪生'], tech_stack: ['C++','Python','工控协议'], target_market: '智能制造', funding_stage: '种子轮', activity_score: 65, bp_summary: '工业控制软件开发商。', employee_count: 8, location: 'A6-901', entered_at: '2024-03', created_at: '2024-03-20T00:00:00Z' },
  { id: 'inc-005', enterprise_id: 'inc-ent-005', name: '清洁智造', products: ['智能清洁机器人','清洁液配方'], tech_stack: ['机器人','导航算法','化工'], target_market: '商业清洁', funding_stage: '天使轮', activity_score: 45, bp_summary: '智能商用清洁机器人。', employee_count: 10, location: 'A6-902', entered_at: '2024-06', created_at: '2024-06-01T00:00:00Z' },
];

export const mockActivityReports: ActivityReport[] = [
  { enterprise_id: 'ent-005', name: '芯视科技', activity_score: 91, trend: 'up', signals: ['本周5次会议室预约','3位投资人来访'] },
  { enterprise_id: 'inc-ent-003', name: '宇和科技', activity_score: 88, trend: 'stable', signals: ['本周3次会议室预约'] },
  { enterprise_id: 'ent-003', name: '北坡科技', activity_score: 82, trend: 'up', signals: ['本周4次会议室预约'] },
  { enterprise_id: 'inc-ent-004', name: '智码科技', activity_score: 65, trend: 'down', signals: ['会议室预约减少50%'] },
  { enterprise_id: 'inc-ent-005', name: '清洁智造', activity_score: 45, trend: 'down', signals: ['连续2周无会议室预约'] },
];

export const mockMatchResult: MatchResult = {
  id: 'match-001', query_text: '仪电集团有个自动洗车项目，谁能做？', query_type: 'demand_to_incubator', sub_tasks: ['机械臂控制','视觉传感方案','软件控制系统','清洁液智能配比'],
  matches: [
    { enterprise_id: 'inc-ent-003', name: '宇和科技', match_reason: '工业机械臂控制系统供应商，曾完成仪电自动化产线项目', match_score: 92, activity_score: 88, location: '漕河泾A6注册', sub_task: '机械臂控制', products: ['工业机械臂控制系统'] },
    { enterprise_id: 'ent-005', name: '芯视科技', match_reason: 'AI视觉传感器可用于车辆识别和定位', match_score: 78, activity_score: 91, location: '漕河泾A6注册', sub_task: '视觉传感方案', products: ['AI视觉传感器芯片'] },
    { enterprise_id: 'inc-ent-004', name: '智码科技', match_reason: 'SCADA系统可用于洗车流程集成控制', match_score: 68, activity_score: 65, location: '漕河泾A6注册', sub_task: '软件控制系统', products: ['SCADA系统'] },
    { enterprise_id: 'inc-ent-005', name: '清洁智造', match_reason: '拥有清洁液智能配比技术', match_score: 55, activity_score: 45, location: '漕河泾A6注册', sub_task: '清洁液智能配比', products: ['清洁液配方'] },
  ],
  combination_suggestion: '推荐组合：宇和科技（机械臂控制）+ 芯视科技（视觉传感器），组合覆盖度 90%。', created_at: '2026-02-09T14:00:00Z',
};

export const mockChatMessages: ChatMessage[] = [
  { id: 'msg-001', role: 'user', content: '仪电集团有个自动洗车项目，我们孵化的企业有谁能参与？', timestamp: '2026-02-09T14:00:00Z' },
  { id: 'msg-002', role: 'assistant', content: '分析「自动洗车项目」，拆解为以下技术环节：\n\n1. 机械臂控制 → 匹配到 宇和科技（匹配度 92%）\n曾完成仪电自动化产线项目，有成熟的机械臂控制方案。\n\n2. 视觉传感方案 → 匹配到 芯视科技（匹配度 78%）\nAI视觉传感器可用于车辆识别和定位。\n\n3. 软件控制系统 → 匹配到 智码科技（匹配度 68%）\nSCADA系统可用于洗车流程集成控制。\n\n4. 清洁液智能配比 → 匹配到 清洁智造（匹配度 55%）\n拥有清洁液智能配比技术。\n\n---\n\n推荐组合方案：宇和科技 + 芯视科技，组合覆盖度 90%。', match_result: mockMatchResult, timestamp: '2026-02-09T14:00:05Z' },
];

export const mockStats: VisitStats = { total_enterprises: 17243, visited_enterprises: 326, total_visits: 589, pending_confirmations: 3, pending_demands: 5 };

// ═══ 查询函数 ═══

export function getEnterprises() { return mockEnterprises; }
export function getEnterprise(id: string) { return mockEnterprises.find(e => e.id === id); }
export function getVisitRecords(enterpriseId?: string) { return enterpriseId ? mockVisitRecords.filter(v => v.enterprise_id === enterpriseId) : mockVisitRecords; }
export function getBackgroundReport(enterpriseId: string) { return mockBackgroundReports.find(r => r.enterprise_id === enterpriseId); }
export function getDemands(enterpriseId?: string) { return enterpriseId ? mockDemands.filter(d => d.enterprise_id === enterpriseId) : mockDemands; }
export function getStats() { return mockStats; }
export function getAssessments(grade?: string) { return grade ? mockAssessments.filter(a => a.grade === grade) : mockAssessments; }
export function getAssessment(id: string) { return mockAssessments.find(a => a.id === id); }
export function getPolicyStats() { return mockPolicyStats; }
export function getPMProgress() { return mockPMProgress; }
export function getIncubatorEnterprises() { return mockIncubatorEnterprises; }
export function getActivityReports() { return mockActivityReports; }
export function getChatMessages() { return mockChatMessages; }
export function getIncubatorStats() {
  const ents = mockIncubatorEnterprises;
  return {
    total_enterprises: ents.length,
    active_enterprises: ents.filter(e => e.activity_score >= 60).length,
    hightech_count: 2,
    total_orders: 12,
    pending_orders: 3,
  };
}
export function getEnterpriseActivityRanking() {
  return mockActivityReports.map(r => ({
    enterprise_id: r.enterprise_id,
    enterprise_name: r.name,
    score: r.activity_score,
  })).sort((a, b) => b.score - a.score);
}
