## 1. 架构设计
目标：以纯前端为主（本地数据+可选导出），优先实现“记录→复盘→计划→执行”闭环，后续可平滑扩展账号与云同步。

```mermaid
flowchart LR
  A["UI(React 页面/组件)"] --> B["状态层(zustand)"]
  B --> C["数据访问层(Repository)"]
  C --> D["本地持久化(localStorage/IndexedDB 其一)"]
  B --> E["统计/规则引擎(三色汇总/警报/建议)"]
  A --> F["通知调度(浏览器通知/应用内提示)"]
```

## 2. 技术说明
- 前端：React@18 + TypeScript + Vite + tailwindcss@3
- 路由：react-router-dom
- 状态管理：zustand（含持久化中间件）
- 图标：lucide-react
- 后端：无（MVP）
- 数据：本地持久化（优先localStorage；若后续需要更大容量与查询，迁移到IndexedDB）

## 3. 路由定义
| 路由 | 目的 |
|------|------|
| / | 入口重定向到 /log |
| /log | 日志（时间线、当下记录、补记与编辑入口） |
| /review | 复盘（每日/每周、警报入口） |
| /planner | 计划（明日计划、时间桶、碎片清单） |
| /focus | 专注（开始、进行中、休息、总结） |
| /emotion | 情绪（SOS、If-Then、小成功） |
| /settings | 设置（通知、复盘时间、阈值等） |

## 4. API 定义
无（MVP为纯前端）。如后续增加云同步，可新增：
- Auth：登录/刷新Token
- Sync：增量同步（TimeEntry/Task/Review等）

## 5. 服务端架构图
无（MVP）。

## 6. 数据模型

### 6.1 数据模型定义
说明：MVP以“时间块记录”为中心；任务、专注、复盘与情绪均可与TimeEntry或Task建立弱关联。

```mermaid
erDiagram
  TIME_ENTRY {
    string id
    string dateKey
    string startAt
    string endAt
    string primaryCategory
    string primaryActivityId
    string[] overlayActivityIds
    string mood
    string interruptionType
    string note
    string createdAt
    string updatedAt
  }

  ACTIVITY {
    string id
    string category
    string name
    boolean archived
    string createdAt
    string updatedAt
  }

  TASK {
    string id
    string category
    string title
    string purpose
    number estimateMinutes
    string completionStandard
    string nextAction
    string status
    string createdAt
    string updatedAt
  }

  FOCUS_SESSION {
    string id
    string taskId
    string startAt
    string endAt
    string mode
    number interruptionCount
    boolean breakEffective
    string createdAt
  }

  DAILY_REVIEW {
    string id
    string dateKey
    string reflectionText
    string frog1
    string frog2
    string frog3
    string energyPlan
    number sleepTargetHours
    string createdAt
    string updatedAt
  }

  IF_THEN_RULE {
    string id
    string ifTrigger
    string thenAction
    string scene
    boolean enabled
    string createdAt
    string updatedAt
  }

  SMALL_WIN {
    string id
    string dateKey
    string text
    string taskId
    string focusSessionId
    string mood
    string createdAt
  }

  ACTIVITY ||--o{ TIME_ENTRY : "primary"
  ACTIVITY ||--o{ TIME_ENTRY : "overlay"
  TASK ||--o{ FOCUS_SESSION : "drives"
  TASK ||--o{ SMALL_WIN : "linked"
  FOCUS_SESSION ||--o{ SMALL_WIN : "linked"
```

### 6.2 数据定义语言
无（MVP不使用数据库）。如后续增加SQLite/后端，再补DDL。
