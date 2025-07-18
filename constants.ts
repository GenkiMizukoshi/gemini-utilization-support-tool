
import { Tasks } from './types';

export const AI_MODEL = 'gemini-2.5-flash';

export const TASKS: Tasks = {
    proofread: {
        name: "文章の校正",
        fields: [
            { id: 'original_text', label: '校正したい文章', type: 'textarea', placeholder: 'ここに文章を入力してください。', required: true },
            { id: 'recipient_type_select', label: '送信先', type: 'select', options: ['取引先', '顧客', '社内', 'その他'], required: true },
            { id: 'recipient_type_custom', label: '送信先（自由入力）', type: 'text', placeholder: '例：株主、提携企業', required: false },
            { id: 'tone', label: 'トーン', type: 'select', options: ['丁寧', '普通', 'カジュアル'], required: false }
        ],
        promptTemplate: (data) => {
            const recipient = data.recipient_type_select === 'その他' ? data.recipient_type_custom : data.recipient_type_select;
            const toneInstruction = data.tone ? `特に、文章全体のトーンが「${data.tone}」になるように調整してください。` : '';

            return `あなたはプロの編集者です。以下の文章を、送信先が「${recipient}」であることを考慮して校正してください。
誤字脱字の修正と、不自然な日本語の改善を重点的にお願いします。
${toneInstruction}

# 元の文章
${data.original_text}

# 出力形式
修正後の文章のみを提示してください。解説は不要です。`;
        }
    },
    email: {
        name: "ビジネスメール作成（文章作成）",
        fields: [
            { id: 'subject', label: '件名（空欄の場合、自動で提案）', type: 'text', placeholder: '例：来週の会議の日程調整について', required: false },
            { id: 'recipient_type_select', label: '送信先', type: 'select', options: ['取引先', '顧客', '社内', 'その他'], required: true },
            { id: 'recipient_type_custom', label: '送信先（自由入力）', type: 'text', placeholder: '例：株主、提携企業', required: false },
            { id: 'tone', label: 'トーン', type: 'select', options: ['丁寧', '普通', 'カジュアル'], required: false },
            { id: 'points', label: '含めるべき要点（箇条書きで入力）', type: 'textarea', placeholder: '・A案件の進捗報告\n・B案件に関する相談\n・添付資料の確認依頼', required: true }
        ],
        promptTemplate: (data) => {
            const subjectInstruction = data.subject 
                ? `件名は「${data.subject}」としてください。` 
                : '内容に最も適した件名を生成してください。';
            const recipient = data.recipient_type_select === 'その他' ? data.recipient_type_custom : data.recipient_type_select;
            
            return `以下の条件で、日本のビジネス文化に適した丁寧なビジネスメールを作成してください。

# 条件
- 送信先: ${recipient}
- ${subjectInstruction}
- トーン: ${data.tone || '丁寧'}
- 含めるべき要点: 
${data.points}

# 出力形式
件名と本文を明確に分けてください。時候の挨拶や結びの言葉も適切に含めてください。ただし、「拝啓」「敬具」は使用しないでください。宛名は含めず、「〇〇様」のような書き出しも不要です。本文から書き始めてください。`
        }
    },
    summarize: {
        name: "文章の要約",
        fields: [
            { id: 'text', label: '要約したい文章', type: 'textarea', placeholder: 'ここに文章を貼り付けてください', required: true, oneOf: 'summary_source' },
            { id: 'file_upload', label: 'または、ファイルをアップロード', type: 'file', required: true, oneOf: 'summary_source' },
            { id: 'format_select', label: '要約の形式', type: 'select', options: ['箇条書きで', '段落で要約', '重要な点を1文で', 'その他（自由入力）'], required: true },
            { id: 'format_custom', label: '補足：要約の形式を自由入力', type: 'text', placeholder: '例：5W1Hを明確にして', required: false }
        ],
        promptTemplate: (data) => {
            const format = data.format_select === 'その他（自由入力）' ? data.format_custom : data.format_select;
            const sourceText = data.fileContent || data.text;
            return `以下の文章を「${format}」で要約してください。要点は明確に、元の文章の意図を正確に捉えてください。\n\n# 元の文章\n${sourceText}`
        }
    },
    brainstorm: {
        name: "アイデア出し",
        fields: [
            { id: 'theme', label: 'テーマ', type: 'text', placeholder: '例：社内コミュニケーションを活性化させる方法', required: true },
            { id: 'count', label: 'アイデアの数', type: 'number', placeholder: '例：10', required: true },
            { id: 'perspective', label: '重視する視点', type: 'text', placeholder: '例：斬新さ、低コストで実現可能か', required: false }
        ],
        promptTemplate: (data) => `以下のテーマについて、アイデアを${data.count}個出してください。\n\n# テーマ\n${data.theme}\n\n# 重視する視点\n${data.perspective}\n\n# 出力形式\n- アイデアは箇条書きで記述してください。\n- それぞれのアイデアに簡単な説明を加えてください。`
    },
    translate: {
        name: "翻訳",
        fields: [
            { id: 'source_lang', label: '翻訳元の言語', type: 'select', options: ['日本語', '英語', '自動検出'], required: false },
            { id: 'target_lang', label: '翻訳先の言語', type: 'select', options: ['英語', '日本語', '中国語'], required: true },
            { id: 'text', label: '翻訳したい文章', type: 'textarea', placeholder: 'ここに翻訳したい文章を入力してください', required: true }
        ],
        promptTemplate: (data) => `以下の文章を${data.source_lang === '自動検出' ? '' : `「${data.source_lang}」から`}「${data.target_lang}」に自然な表現で翻訳してください。\n\n# 翻訳対象の文章\n${data.text}`
    },
    escalation_summary: {
        name: "エスカレーション用サマリー作成",
        fields: [
            { id: 'report_type', label: '報告種別', type: 'select', options: ['システム不具合', '運用不備', 'クライアント報告'], required: true },
            { id: 'communication_history', label: 'これまでの経緯や事象の詳細', type: 'textarea', placeholder: '顧客とのメール、チャット履歴、発生した事象の詳細などを貼り付けてください。', required: true },
        ],
        promptTemplate: (data) => {
            let prompt = '';
            switch (data.report_type) {
                case 'システム不具合':
                    prompt = `あなたは優秀なインシデントマネージャーです。以下の情報から、システム不具合の報告書を作成してください。各項目について、情報がない場合は「不明」または「確認中」と記述してください。

# 入力情報
${data.communication_history}

# 出力フォーマット
ブランド起因ではありますが、顧客影響のある事象が発生しているようです。
すでにどなたかキャッチし、明日のご対応準備をいただいておりますでしょうか。

▼ブランド
[入力情報からブランド名やサイト名を抽出]

▼セキュリティインシデント
該当しない

▼発生事象および影響範囲、影響内容
[入力情報から、何が起きていて、どのような影響が出ているかを具体的に記述]

▼検知日時
[入力情報から日時を抽出。例：YYYY/MM/DD HH:MM]

▼検知者
[入力情報から誰が検知したかを抽出。例：ブランド様からのご連絡]

▼発生期間
確認中

▼原因
調査中

▼対応状況
調査中

▼お客様側の対応
[入力情報から、顧客にどのような対応が必要か、またはブランドから指示があったかを記述]`;
                    break;
                case '運用不備':
                    prompt = `あなたはチームリーダーです。以下の情報から、運用不備の報告書を作成してください。各項目について、情報がない場合は「不明」または「確認中」と記述してください。

# 入力情報
${data.communication_history}

# 出力フォーマット
運用不備が発生いたしましたのでご報告いたします。

■発生日
[入力情報から発生日を抽出]

■発覚日
[入力情報から発覚日と発覚経緯を抽出]

■発生事象
[入力情報から、何が起きたのかを具体的に記述]

■発生原因
[入力情報から、なぜその事象が発生したのか原因を記述]

■対策
確認中

■お客様対応
[入力情報から、顧客に対してどのような対応を検討・実施しているかを記述]

■クライアント報告
[入力情報から、クライアントへの報告状況を記述]`;
                    break;
                case 'クライアント報告':
                    prompt = `あなたは顧客対応の責任者です。以下の情報をもとに、クライアント向けの丁寧な不具合報告メールを作成してください。

# 入力情報
${data.communication_history}

# 出力フォーマット
お世話になっております。
[入力情報をもとに、いつ、何がリリースされ、どのような不具合が判明したのかを丁寧に記述]

■現象
[入力情報から、具体的な現象を箇条書きで記述]

■発生原因
[入力情報から、原因を具体的に記述]

■影響
[入力情報から、顧客や売上、データへの影響を箇条書きで記述]

■対応
[入力情報から、今後の修正や顧客対応の計画を箇条書きで記述]

この度はご迷惑をおかけし申し訳ございません。
ご不明点やご質問などございましたらお知らせいただけますと幸いです。
ご確認の程よろしくお願いいたします。`;
                    break;
            }
            return prompt;
        }
    },
    persona_creation: {
        name: "ペルソナ（顧客像）作成",
        fields: [
            { id: 'product_service_select', label: '商品・サービスカテゴリ', type: 'select', options: ['BtoC商材', 'BtoB商材', 'その他（自由入力）'], required: true },
            { id: 'product_service_custom', label: '商品・サービス名（自由入力）', type: 'text', placeholder: '例：ECサイト向け高機能CRMツール', required: false },
            { id: 'target_info', label: 'ターゲット層の情報（箇条書き）', type: 'textarea', placeholder: '・中小企業のECサイト運営者\n・顧客との関係構築に課題を感じている\n・データ分析は苦手', required: true }
        ],
        promptTemplate: (data) => {
            const productService = data.product_service_select === 'その他（自由入力）' ? data.product_service_custom : data.product_service_select;
            return `あなたは経験豊富なマーケターです。以下の情報に基づいて、商品・サービスのターゲットとなる具体的なペルソナを作成してください。\n\n# 商品・サービス\n${productService}\n\n# ターゲット層の情報\n${data.target_info}\n\n# 出力形式\n以下の項目を具体的に埋めて、一人の人物像が浮かび上がるようなペルソナを作成してください。\n- **名前:**\n- **年齢:**\n- **性別:**\n- **職業・役職:**\n- **ライフスタイル:**\n- **価値観・性格:**\n- **抱えている課題・悩み:**\n- **情報収集の方法:**\n- **商品・サービスに期待すること:**`
        }
    },
    ad_copy: {
        name: "広告コピー・キャッチフレーズ作成",
        fields: [
            { id: 'product_service_select', label: '商品・サービスカテゴリ', type: 'select', options: ['BtoC商材', 'BtoB商材', 'その他（自由入力）'], required: true },
            { id: 'product_service_custom', label: '商品・サービス名（自由入力）', type: 'text', placeholder: '例：AI議事録自動作成ツール「Transcribe Pro」', required: false },
            { id: 'target_audience', label: 'ターゲット層', type: 'text', placeholder: '例：会議の多いビジネスパーソン', required: true },
            { id: 'features', label: '商品・サービスの主な特徴（箇条書き）', type: 'textarea', placeholder: '・98%の高精度な文字起こし\n・話者分離機能\n・ワンクリックで要約を作成', required: true },
            { id: 'appeal_point', label: '最も訴求したいポイント', type: 'text', placeholder: '例：議事録作成の時間が1/10になる', required: true }
        ],
        promptTemplate: (data) => {
            const productService = data.product_service_select === 'その他（自由入力）' ? data.product_service_custom : data.product_service_select;
            return `あなたはプロのコピーライターです。以下の情報に基づいて、読者の心に響く広告コピーとキャッチフレーズをそれぞれ5つずつ作成してください。\n\n# 商品・サービス名\n${productService}\n\n# ターゲット層\n${data.target_audience}\n\n# 主な特徴\n${data.features}\n\n# 最も訴求したいポイント\n${data.appeal_point}\n\n# 出力形式\n- **キャッチフレーズ案 (5つ):** (短く、インパクトのあるフレーズ)\n- **広告コピー案 (5つ):** (ターゲットの課題に共感し、解決策として商品を提示する短い文章)`
        }
    },
    competitor_analysis: {
        name: "競合分析レポート",
        fields: [
            { id: 'product_service', label: '自社の商品・サービス', type: 'text', placeholder: '例：オーガニック野菜の宅配サービス', required: true },
            { id: 'competitor_info', label: '競合の情報（URLや特徴など）', type: 'textarea', placeholder: '例：A社 (https://example.com) - 価格が安いが品揃えは少ない。\nB社 - 高級路線で品質が高い。', required: true }
        ],
        promptTemplate: (data) => `あなたはマーケティングアナリストです。以下の情報に基づいて、競合分析の簡易レポートを作成してください。\n\n# 自社の商品・サービス\n${data.product_service}\n\n# 競合の情報\n${data.competitor_info}\n\n# 出力形式\n以下の項目について、競合の強み・弱み、そして自社が取るべき戦略の方向性を分析し、箇条書きで分かりやすくまとめてください。\n- **競合の強み (Strength):**\n- **競合の弱み (Weakness):**\n- **自社にとっての機会 (Opportunity):**\n- **自社にとっての脅威 (Threat):**\n- **考察・自社の取るべき戦略:**`
    },
    ga_summary: {
        name: "GA4/サーチコンソールデータ要約",
        fields: [
            { id: 'file_upload', label: 'GA4/サーチコンソールからエクスポートしたCSVファイル', type: 'file', required: true },
            { id: 'analysis_goal', label: '特に分析したいこと', type: 'text', placeholder: '例：直帰率が高いページの原因と対策', required: true }
        ],
        promptTemplate: (data) => `あなたはプロのWebアナリストです。以下のCSVデータ（Googleアナリティクス4またはGoogleサーチコンソールからエクスポートされたもの）を分析し、レポートを作成してください。\n\n# 特に分析したいこと\n${data.analysis_goal}\n\n# CSVデータ\n\`\`\`csv\n${data.fileContent}\n\`\`\`\n\n# 出力形式\n以下の構成で、具体的な改善アクションに繋がるレポートを作成してください。\n1.  **データの概要:** (データ全体の主要な傾向を要約)\n2.  **問題点の指摘:** (データから読み取れる具体的な問題点を3つ指摘)\n3.  **改善提案:** (指摘した問題点それぞれに対する、具体的な改善アクションを提案)`
    },
    meta_description: {
        name: "メタディスクリプション生成・リライト提案",
        fields: [
            { id: 'page_topic', label: 'ページのメイントピックやキーワード', type: 'textarea', placeholder: '例：AIを活用したECサイト向けCRMツールの特徴と導入事例', required: true },
            { id: 'page_url', label: '対象ページのURL（任意）', type: 'text', placeholder: 'https://example.com/service/new-product', required: false }
        ],
        promptTemplate: (data) => `あなたはプロのSEOライターです。以下の情報に基づいて、Googleの検索結果でクリック率が高まるような、SEOに最適なタイトルとメタディスクリプションを3案ずつ作成してください。\n\n# 対象URL\n${data.page_url || '指定なし'}\n\n# ページのメイントピック・キーワード\n${data.page_topic}\n\n# 作成のポイント\n- キーワードを自然に含める\n- ユーザーの興味を引く具体的なメリットを提示する\n- クリックを促す行動喚起（CTA）を含める\n- 重複表現を避ける\n\n# 出力形式\n**【提案1】**\n- **タイトル:** (タイトル案1)\n- **メタディスクリプション:** (メタディスクリプション案1)\n\n**【提案2】**\n- **タイトル:** (タイトル案2)\n- **メタディスクリプション:** (メタディスクリプション案2)\n\n**【提案3】**\n- **タイトル:** (タイトル案3)\n- **メタディスクリプション:** (メタディスクリプション案3)`
    },
    sitemap_robotstxt: {
        name: "自動サイトマップ・robots.txt生成",
        fields: [
            { id: 'file_upload', label: 'サイトのURL一覧ファイル (TXT, CSV)', type: 'file', required: true }
        ],
        promptTemplate: (data) => `あなたはウェブサイトの専門家です。以下のURLリストに基づいて、最適なsitemap.xmlとrobots.txtを生成してください。リスト内に# DisallowとコメントがあるURLはrobots.txtでクロールを拒否してください。\n\n# URLリスト\n${data.fileContent}\n\n# 出力形式\n## sitemap.xml\n(ここにsitemap.xmlのコードを生成)\n\n## robots.txt\n(ここにrobots.txtのコードを生成)\n\nそれぞれ、そのままコピーして使えるようにコードブロックで囲んでください。`
    },
    presentation: {
        name: "プレゼン構成案",
        fields: [
            { id: 'theme', label: 'プレゼンのテーマ', type: 'text', placeholder: '例：新製品〇〇のマーケティング戦略', required: true },
            { id: 'background', label: 'プレゼンの背景・経緯', type: 'textarea', placeholder: '例：若年層の売上低下という課題があり、新たな顧客層獲得のために新製品を開発した。', required: false },
            { id: 'audience', label: '対象者（聴衆）', type: 'text', placeholder: '例：営業部門のマネージャー', required: true },
            { id: 'time', label: '発表時間（分）', type: 'number', placeholder: '例：15', required: true },
            { id: 'goal', label: 'プレゼンのゴール', type: 'text', placeholder: '例：提案する戦略の承認を得て、実行予算を獲得する。', required: true },
            { id: 'key_message', label: '最も伝えたい核心的なメッセージ', type: 'text', placeholder: '例：この新製品は、新たな市場を切り開く鍵となる。', required: true },
            { id: 'desired_reaction', label: '聴衆に期待する反応・行動', type: 'text', placeholder: '例：戦略の有効性を理解し、実行に協力的になってもらう。', required: false },
            { id: 'include_elements', label: '含めたい要素（箇条書き）', type: 'textarea', placeholder: '・市場調査のデータ\n・競合製品との比較\n・具体的なアクションプランとスケジュール', required: false }
        ],
        promptTemplate: (data) => `以下の条件で、説得力のあるプレゼンテーションの構成案を作成してください。\n\n# プレゼンのテーマ\n${data.theme}\n\n# 背景・経緯\n${data.background}\n\n# 対象者（聴衆）\n${data.audience}\n\n# 発表時間\n${data.time}分\n\n# プレゼンのゴール\n${data.goal}\n\n# 最も伝えたい核心的なメッセージ\n${data.key_message}\n\n# 聴衆に期待する反応・行動\n${data.desired_reaction}\n\n# 含めたい要素\n${data.include_elements}\n\n# 出力形式\n- 全体のストーリーが論理的に流れるように構成してください。\n- 各スライドのタイトル、話す内容の要点、そして想定される時間配分を具体的に示してください。`
    },
    meeting_summary: {
        name: "商談の要点まとめ・ネクストアクション提案",
        fields: [
            { id: 'meeting_notes', label: '商談の議事録やメモ', type: 'textarea', placeholder: 'ここに議事録やメモのテキストを貼り付けてください。', required: true, oneOf: 'meeting_source' },
            { id: 'file_upload', label: 'または、議事録ファイルをアップロード', type: 'file', required: true, oneOf: 'meeting_source' }
        ],
        promptTemplate: (data) => {
            const sourceText = data.fileContent || data.meeting_notes;
            return `あなたは優秀な営業アシスタントです。以下の商談議事録を分析し、要点と次のアクションをまとめてください。\n\n# 商談議事録\n${sourceText}\n\n# 出力形式\n以下の構成で、簡潔に分かりやすくまとめてください。\n- **商談のサマリー:** (誰が、何について話し、どうなったか)\n- **決定事項:** (合意したこと、決まったこと)\n- **顧客の主な課題・ニーズ:** (顧客が何に困っているか)\n- **提案すべきネクストアクション:** (次に取るべき具体的な行動)`
        }
    },
    approach_email: {
        name: "顧客へのアプローチメール作成",
        fields: [
            { id: 'customer_persona', label: '顧客ペルソナ', type: 'textarea', placeholder: '例：株式会社〇〇、営業部長、田中様。先日の展示会で名刺交換。ECサイトの売上拡大に強い関心あり。', required: true },
            { id: 'product_service', label: '提案したい商品・サービス', type: 'text', placeholder: '例：弊社の最新CRMツール「Sales Navigator」', required: true },
            { id: 'goal', label: 'このメールのゴール', type: 'text', placeholder: '例：15分程度のオンラインMTGのアポイント獲得', required: true }
        ],
        promptTemplate: (data) => `あなたはトップセールスです。以下の情報に基づいて、顧客の心に響くパーソナライズされたアプローチメールを3パターン作成してください。\n\n# 顧客ペルソナ\n${data.customer_persona}\n\n# 提案したい商品・サービス\n${data.product_service}\n\n# メールを送る目的（ゴール）\n${data.goal}\n\n# 出力形式\n件名と本文を含んだ、すぐに使えるメール形式で3パターン提案してください。各パターンの切り口（例：課題解決を訴求、導入事例を提示など）も簡単に説明してください。`
    },
    faq_generation: {
        name: "想定問答集の作成",
        fields: [
            { id: 'product_service', label: '商品・サービス概要', type: 'textarea', placeholder: 'ここに商品やサービスの特徴、価格などの情報を入力してください。', required: true },
            { id: 'customer_persona', label: '主な顧客ペルソナ（任意）', type: 'textarea', placeholder: '例：ITリテラシーがあまり高くない中小企業の経営者', required: false }
        ],
        promptTemplate: (data) => `あなたは製品知識が豊富なカスタマーサポートのリーダーです。以下の情報に基づいて、顧客からよく寄せられる質問とそれに対する模範解答をまとめた「想定問答集」を作成してください。\n\n# 商品・サービス情報\n${data.product_service}\n\n# 主な顧客ペルソナ\n${data.customer_persona || '指定なし'}\n\n# 出力形式\n「Q. (想定される質問)」と「A. (分かりやすい回答)」の形式で、少なくとも10個の質問と回答のペアを作成してください。ペルソナが入力されている場合は、そのペルソナが抱きそうな質問を中心に構成してください。`
    },
    product_description: {
        name: "ECサイトの商品紹介文作成",
        fields: [
            { id: 'product_name', label: '商品名', type: 'text', placeholder: '例：天然由来成分100% オーガニックシャンプー', required: true },
            { id: 'features', label: '商品の特長・仕様（箇条書き）', type: 'textarea', placeholder: '・シリコン、パラベン不使用\n・保湿成分としてアルガンオイル配合\n・リラックスできるシトラスの香り', required: true },
            { id: 'target_audience', label: 'ターゲット顧客', type: 'text', placeholder: '例：髪のダメージや頭皮の乾燥に悩む30代女性', required: true },
            { id: 'keywords', label: '含めたいキーワード（SEO対策）', type: 'text', placeholder: '例：ノンシリコン, ボタニカル, 美髪', required: false }
        ],
        promptTemplate: (data) => `あなたはプロのコピーライターです。ECサイトに掲載するため、以下の商品の紹介文を作成してください。\n\n# 商品名\n${data.product_name}\n\n# 商品の特長・仕様\n${data.features}\n\n# ターゲット顧客\n${data.target_audience}\n\n# 含めたいキーワード\n${data.keywords}\n\n# 出力形式\n- 顧客の心を掴むキャッチコピー\n- 商品の魅力を伝える詳細な説明文（共感を呼ぶストーリーを交えて）\n- 特長をまとめた箇条書き\n上記の3つの要素を含んだ、購買意欲をそそる文章を作成してください。`
    },
    newsletter: {
        name: "メルマガ・LINE配信用文章作成",
        fields: [
            { id: 'campaign_theme', label: 'キャンペーンのテーマ・件名', type: 'text', placeholder: '例：【週末限定】全品20%OFFクーポンプレゼント！', required: true },
            { id: 'target_audience', label: '配信対象', type: 'text', placeholder: '例：過去半年以内に購入したリピーターのお客様', required: false },
            { id: 'key_points', label: '伝えたい要点（箇条書き）', type: 'textarea', placeholder: '・セール期間\n・クーポンの利用方法\n・おすすめ商品3選', required: true },
            { id: 'tone', label: 'トーン', type: 'select', options: ['丁寧', '親しみやすく', 'プロフェッショナル'], required: false }
        ],
        promptTemplate: (data) => `以下の条件で、メールマガジンまたはLINEで配信する文章を作成してください。\n\n# キャンペーンのテーマ・件名\n${data.campaign_theme}\n\n# 配信対象\n${data.target_audience}\n\n# 伝えたい要点\n${data.key_points}\n\n# トーン\n${data.tone}\n\n# 出力形式\n読者の開封率やクリック率が高まるような、魅力的で分かりやすい文章を作成してください。件名（タイトル）と本文を明確に分けてください。`
    },
    sns_post: {
        name: "SNS投稿文作成",
        fields: [
            { id: 'platform', label: 'SNSプラットフォーム', type: 'select', options: ['Instagram', 'X (旧Twitter)', 'Facebook'], required: true },
            { id: 'topic', label: '投稿のトピック', type: 'text', placeholder: '例：新商品「うるおいフェイスマスク」の発売開始', required: true },
            { id: 'details', label: '投稿に含める詳細情報', type: 'textarea', placeholder: '・商品の特徴\n・発売記念キャンペーンの内容\n・商品ページへのリンク', required: false },
            { id: 'hashtags_count', label: 'ハッシュタグの希望個数', type: 'number', placeholder: '例：5', required: false }
        ],
        promptTemplate: (data) => `以下の情報に基づいて、${data.platform}用のSNS投稿を作成してください。\n\n# 投稿トピック\n${data.topic}\n\n# 詳細情報\n${data.details}\n\n# 出力形式\n- ユーザーの興味を引き、エンゲージメント（いいね、コメント、シェア）を高めるような投稿文を作成してください。\n- ${data.platform}の特性に合わせて、文章の長さや表現を調整してください。\n- 関連性が高く、効果的なハッシュタグを${data.hashtags_count || 5}個提案してください。`
    },
    cs_reply: {
        name: "カスタマーサポート返信案作成",
        fields: [
            { id: 'inquiry_summary', label: 'お客様からの問い合わせ内容', type: 'textarea', placeholder: '例：「注文した商品がまだ届きません。配送状況を教えてください。注文番号: 12345」', required: true },
            { id: 'situation', label: '状況', type: 'select', options: ['感謝', '謝罪', '質問への回答', '案内'], required: true },
            { id: 'resolution', label: '回答・解決策の要点', type: 'text', placeholder: '例：配送遅延のお詫び。現在の配送状況と、お届け予定日を伝える。', required: true }
        ],
        promptTemplate: (data) => `あなたはECサイトの優秀なカスタマーサポート担当者です。以下のお客様からの問い合わせに対して、返信メールの文案を作成してください。\n\n# 問い合わせ内容\n${data.inquiry_summary}\n\n# 対応の方向性\n${data.situation}\n\n# 回答の要点\n${data.resolution}\n\n# 出力形式\nお客様の不安や不満に寄り添い、丁寧かつ共感的な姿勢が伝わるような文章を作成してください。件名と本文を明確に分け、ビジネスメールとして適切な形式で記述してください。`
    },
    claim_email: {
        name: "クレーム対応メール作成",
        fields: [
            { id: 'claim_content', label: '顧客からのクレーム内容', type: 'textarea', placeholder: 'ここに顧客からのクレーム内容を貼り付けてください。', required: true },
            { id: 'response_policy', label: '対応方針', type: 'select', options: ['共感と傾聴を優先し、鎮静化を図る', '具体的な解決策・代替案を提示する', '毅然とした態度で、できないことは断る'], required: true },
            { id: 'customer_info', label: '顧客情報（任意）', type: 'textarea', placeholder: '例：リピート顧客、田中様', required: false }
        ],
        promptTemplate: (data) => `あなたはベテランのカスタマーサポート責任者です。以下のクレームに対し、指定された方針に基づいて、丁寧かつ適切な返信メールを作成してください。\n\n# クレーム内容\n${data.claim_content}\n\n# 対応方針\n${data.response_policy}\n\n# 顧客情報\n${data.customer_info || '指定なし'}\n\n# 出力形式\n件名と本文を含むビジネスメールの形式で作成してください。まず顧客の感情に寄り添う言葉を入れ、冷静かつ誠実な対応を心がけてください。指定された方針に基づき、具体的なフレーズや説明例を盛り込んでください。`
    },
    formula_gen: {
        name: "Excel/スプレッドシート数式作成",
        fields: [
            { id: 'target_app', label: '使用するアプリ', type: 'select', options: ['Excel', 'Googleスプレッドシート'], required: true },
            { id: 'use_case', label: 'やりたいことのカテゴリ', type: 'select', options: ['データの集計（合計、平均、件数など）', '特定のデータを探す・取り出す（VLOOKUPなど）', '条件によって表示を変える（IFなど）', '文字を整える・つなげる', '日付を計算する', 'その他（自由入力）'], required: true },
            { id: 'data_example', label: 'データのサンプルを貼り付け', type: 'textarea', placeholder: '例:\n      A         B        C\n1   商品名     カテゴリ   売上\n2   りんご     果物       100\n3   みかん     果物       150\n4   キャベツ   野菜       200', required: true, oneOf: 'sample_data' },
            { id: 'file_upload', label: 'または、サンプルファイルをアップロード', type: 'file', required: true, oneOf: 'sample_data' },
            { id: 'task_details', label: '具体的な指示', type: 'textarea', placeholder: '例：E1セルに、カテゴリが「果物」である商品の売上合計を計算したい。', required: true }
        ],
        promptTemplate: (data) => {
            const sampleData = data.fileContent || data.data_example;
            return `あなたは${data.target_app}の専門家です。以下の条件に基づいて、ユーザーの要求を満たす数式を作成してください。\n\n# 使用するアプリケーション\n${data.target_app}\n\n# やりたいことのカテゴリ\n${data.use_case}\n\n# データのサンプル\n\`\`\`\n${sampleData}\n\`\`\`\n\n# 具体的な指示\n${data.task_details}\n\n# 出力形式\n1. **提案する数式:**\n   (ここに数式を記述)\n2. **数式の説明:**\n   (数式が何をしているのか、各部分が何を意味するのかを分かりやすく解説)\n3. **使用上の注意:**\n   (数式を貼り付ける際の注意点や、応用方法などを記載)\n\n数式はそのままコピーして使えるように、\`=...\` の形式で提示してください。`
        }
    },
    client_slide_gen: {
        name: "修正方針要件サマリー",
        fields: [
            { id: 'communication_history', label: 'BacklogやSlackのやり取り', type: 'textarea', placeholder: 'ここにBacklogの課題やSlackのスレッドを貼り付けてください。', required: true, oneOf: 'source_material' },
            { id: 'file_upload', label: 'または、エクスポートしたファイルをアップロード', type: 'file', accept: ".txt,.csv,.md", required: true, oneOf: 'source_material' }
        ],
        promptTemplate: (data) => {
            const sourceText = data.fileContent || data.communication_history;
            return `あなたは、技術的な議論を非エンジニアのクライアントにも分かりやすく説明できる、経験豊富なプロジェクトマネージャーです。
以下のBacklogやSlackでのやり取りを分析し、クライアントに提出するための報告スライドの原稿を作成してください。

# 元のやり取り
\`\`\`
${sourceText}
\`\`\`

# 出力形式
出力は、以下の構成で、専門用語を避け、平易な言葉で記述してください。各項目はマークダウンのヘッダー（##）を使ってください。

## 1. ご報告の概要
この修正が「何のために行われるのか」を簡潔に説明してください。

## 2. 修正の目的・背景
どのような課題や要望があり、それを解決するために今回の修正が必要になったのか、経緯を説明してください。

## 3. 修正内容と対応方針
エンジニアが「具体的に何をするのか」を、比喩などを用いて非エンジニアにもイメージが湧くように説明してください。

## 4. 影響範囲
この修正によって、ユーザーの操作や他の機能にどのような影響があるか、または影響がないことを明確に記述してください。特に影響がない場合は「今回の修正によるユーザー操作への直接的な影響はございません」と記載してください。

## 5. リリース予定日
リリース予定日を記載してください。やり取りから判断できない場合は「未定（確定次第、改めてご報告します）」と記載してください。`
        }
    },
    effort_estimation: {
        name: "概算工数見積もり",
        fields: [
            { id: 'platform_select', label: '対象プラットフォーム', type: 'select', options: ['EC-CUBE', 'SFCC', 'Shopify', 'その他'], required: true },
            { id: 'platform_custom', label: 'プラットフォーム名（自由入力）', type: 'text', placeholder: '例：Magento, WooCommerce', required: false },
            { id: 'requirements_text', label: '要件（箇条書きなどで入力）', type: 'textarea', placeholder: '・会員登録時に追加のアンケート項目を5つ表示する\n・マイページに購入履歴一覧を追加する\n・特定の送料無料商品と通常商品を同時に購入した場合、送料を無料にする', required: true, oneOf: 'requirements_source' },
            { id: 'requirements_file', label: 'または、要件定義書をアップロード', type: 'file', accept: ".txt,.csv,.md,.pdf,.doc,.docx", required: true, oneOf: 'requirements_source' }
        ],
        promptTemplate: (data) => {
            const platform = data.platform_select === 'その他' ? data.platform_custom : data.platform_select;
            const requirements = data.fileContent || data.requirements_text;
            return `あなたは経験豊富なテックリードです。以下の要件とプラットフォーム情報に基づいて、開発の概算工数を見積もってください。

# 案件概要
- プラットフォーム: ${platform}
- 要件:
\`\`\`
${requirements}
\`\`\`

# 出力形式
以下の構成で、マークダウン形式で出力してください。

## 1. WBS（作業分解構成図）と概算工数
要件を実現するために必要だと思われるタスクを細分化し、それぞれのタスクに対する現実的な工数（時間単位）を記載してください。

| 大項目 | 中項目（タスク） | 担当 | 想定工数（時間） | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| 設計 | 画面設計 | FE | 8 | |
| | DB設計 | BE | 4 | |
| 実装 | フロントエンド | FE | 40 | |
| | バックエンド | BE | 60 | |
| テスト | 単体テスト | FE/BE | 20 | |
| | 結合テスト | QA | 16 | |
| その他 | 環境構築 | Infra | 8 | |
| | MTG/レビュー | ALL | 10 | |
| **合計** | | | **166** | |

## 2. 見積もりの前提条件
- 今回の見積もりは、どのような条件下で算出されたものか、前提条件を箇条書きで記載してください。（例：デザイン作成の工数は含まない、など）

## 3. 確認事項・不明点
- 要件の中で曖昧な点や、実装方針を決定するために追加で確認が必要な事項を箇条書きで記載してください。`
        }
    },
    code_gen: {
        name: "コード生成",
        fields: [
            { id: 'language', label: '言語', type: 'select', options: ['複数言語（自動検出）', 'JavaScript', 'Python', 'HTML/CSS', 'SQL'], required: true },
            { id: 'request', label: '生成したいコードの内容', type: 'textarea', placeholder: '例：ECサイトの商品一覧を表示するReactコンポーネント。商品画像、商品名、価格、カート追加ボタンを含む。', required: true },
            { id: 'file_upload', label: 'サンプルファイル（任意）', type: 'file', required: false }
        ],
        promptTemplate: (data) => {
            const langInstruction = data.language === '複数言語（自動検出）'
                ? '言語は指定された要件から自動で判断してください。'
                : `言語は${data.language}でお願いします。`;

            const sampleFileInstruction = data.fileContent
                ? `\n\n# 参考にするサンプルコード\n\`\`\`\n${data.fileContent}\n\`\`\``
                : '';

            const outputLang = data.language === '複数言語（自動検出）' ? '' : data.language.toLowerCase().split('/')[0];

            return `以下の要件を満たすコードを生成してください。${langInstruction}コードはすぐに利用できるよう、完成形で提供してください。${sampleFileInstruction}\n\n# 要件\n${data.request}\n\n# 出力\n\`\`\`${outputLang}\n{{コード}}\n\`\`\``
        }
    },
    code_review: {
        name: "コードレビュー支援",
        fields: [
            { id: 'file_upload', label: 'レビューするコードファイル', type: 'file', required: true },
            { id: 'review_points', label: '特にレビューしてほしい点', type: 'text', placeholder: '例：パフォーマンス、セキュリティ、可読性', required: true }
        ],
        promptTemplate: (data) => `あなたはシニアエンジニアとして、以下のソースコードをレビューしてください。\n\n# 特にレビューしてほしい点\n${data.review_points}\n\n# レビュー対象のコード\n\`\`\`\n${data.fileContent}\n\`\`\`\n\n# 出力形式\n- **良い点 (Good Points):**\n- **改善提案 (Suggestions for Improvement):** (具体的な修正コード例を添えてください)\n- **潜在的なバグや懸念点 (Potential Bugs/Concerns):**\n上記の項目で、箇条書きで分かりやすく指摘してください。`
    },
    test_case: {
        name: "テストケース作成",
        fields: [
            { id: 'feature_spec', label: 'テスト対象の機能や仕様', type: 'textarea', placeholder: '例：ECサイトのログイン機能。メールアドレスとパスワードでログイン。3回失敗でアカウントロック。', required: true },
            { id: 'test_type', label: 'テストの種類', type: 'select', options: ['単体テスト', '結合テスト', 'E2Eテストシナリオ'], required: true }
        ],
        promptTemplate: (data) => `以下の機能仕様に基づき、${data.test_type}のテストケースを作成してください。\n\n# 機能仕様\n${data.feature_spec}\n\n# 出力形式\n- テストID\n- テスト項目\n- 前提条件\n- 操作手順\n- 期待結果\nの形式で、正常系・異常系を網羅したテストケースを表形式（マークダウン）で作成してください。`
    },
    log_analysis: {
        name: "ログ解析",
        fields: [
            { id: 'file_upload', label: '解析するログファイル (.log, .txt)', type: 'file', required: true },
            { id: 'analysis_request', label: '調査したいこと', type: 'text', placeholder: '例：発生しているエラーの種類と頻度を特定して。', required: true }
        ],
        promptTemplate: (data) => `以下のログデータを解析し、リクエストに回答してください。\n\n# 調査リクエスト\n${data.analysis_request}\n\n# ログデータ\n\`\`\`\n${data.fileContent}\n\`\`\`\n\n# 出力\n調査結果を要約し、関連するログの抜粋と共に報告してください。`
    },
    sql_gen: {
        name: "SQLクエリ生成",
        fields: [
            { id: 'db_schema', label: 'データベーススキーマ（テーブル名、カラム名など）', type: 'textarea', placeholder: '例：users(id, name, email), orders(id, user_id, product_id, amount, created_at)', required: true },
            { id: 'request', label: '取得したいデータの内容', type: 'text', placeholder: '例：過去1ヶ月で最も売れた商品トップ5', required: true }
        ],
        promptTemplate: (data) => `以下のデータベーススキーマと要件に基づいて、SQLクエリを生成してください。\n\n# データベーススキーマ\n${data.db_schema}\n\n# 要件\n${data.request}\n\n# 出力\n生成したSQLクエリと、そのクエリの簡単な説明を記述してください。`
    },
    it_troubleshoot: {
        name: "ITトラブルシューティング",
        fields: [
            { id: 'problem', label: '発生している問題', type: 'textarea', placeholder: '例：会社のWi-Fiに接続できない。自分のPCだけ繋がらないようです。OSはWindows 11です。', required: true },
        ],
        promptTemplate: (data) => `あなたは情報システム部の担当者です。以下の問い合わせについて、ユーザーが自身で試せるトラブルシューティングの手順を、初心者にも分かりやすく、ステップバイステップで回答してください。\n\n# 問い合わせ内容\n${data.problem}\n\n# 回答のポイント\n- 最初に試すべき簡単な手順から案内する。\n- 専門用語は避け、平易な言葉で説明する。\n- それでも解決しない場合に、情シスに連絡する方法を記載する。`
    },
    script_gen: {
        name: "シェル/PowerShellスクリプト生成",
        fields: [
            { id: 'os', label: '対象OS', type: 'select', options: ['Windows (PowerShell)', 'Linux/macOS (Bash)'], required: true },
            { id: 'task', label: '自動化したいタスク', type: 'textarea', placeholder: '例：特定のフォルダ内にある、1ヶ月以上更新されていないlogファイルをすべて削除するスクリプト', required: true }
        ],
        promptTemplate: (data) => `以下のタスクを実行するための${data.os}スクリプトを生成してください。\n\n# 自動化したいタスク\n${data.task}\n\n# 出力形式\n- スクリプトコード（コメント付き）\n- スクリプトの簡単な説明\n- 実行前の注意点\nを記載してください。`
    },
    it_vendor_comparison: {
        name: "ITベンダー比較表作成",
        fields: [
            { id: 'vendor_a_info', label: 'ベンダーAの情報（製品名、価格、特徴など）', type: 'textarea', placeholder: '製品名：〇〇チャット\n価格：1ユーザー800円/月\n特徴：UIが直感的、外部連携が豊富', required: true },
            { id: 'vendor_b_info', label: 'ベンダーBの情報', type: 'textarea', placeholder: '製品名：△△トーク\n価格：1ユーザー750円/月\n特徴：セキュリティが高い、ファイル管理機能が強力', required: true },
            { id: 'comparison_points', label: '比較したい項目（カンマ区切り）', type: 'text', placeholder: '例：価格, 主な機能, セキュリティ, サポート体制', required: true }
        ],
        promptTemplate: (data) => `あなたはITコンサルタントです。以下の2つの製品・サービスについて、公平な視点で比較検討表を作成してください。\n\n# ベンダーAの情報\n${data.vendor_a_info}\n\n# ベンダーBの情報\n${data.vendor_b_info}\n\n# 比較項目\n${data.comparison_points}\n\n# 出力形式\nマークダウン形式の表（テーブル）で、各比較項目について分かりやすくまとめてください。最後に、どちらのベンダーがどのようなニーズに適しているか、簡単な総評も加えてください。`
    },
    it_setup_manual: {
        name: "新人用セットアップ手順書作成",
        fields: [
            { id: 'employee_name', label: '新入社員の氏名', type: 'text', placeholder: '例：鈴木 一郎', required: true },
            { id: 'department', label: '配属部署', type: 'text', placeholder: '例：EC事業部', required: true },
            { id: 'pc_type', label: 'PCの種類', type: 'select', options: ['Windows', 'Mac'], required: true },
            { id: 'required_tools', label: '使用する主要ツール（箇条書き）', type: 'textarea', placeholder: '・Google Workspace\n・Slack\n・Shopify管理画面', required: true }
        ],
        promptTemplate: (data) => `以下の情報に基づき、新入社員向けのPCセットアップ手順書を作成してください。\n\n# 対象者\n- 氏名: ${data.employee_name}\n- 配属部署: ${data.department}\n\n# セットアップ対象PC\n- OS: ${data.pc_type}\n\n# 導入必須ツール\n${data.required_tools}\n\n# 出力形式\n新入社員が一人でも作業を進められるように、以下の項目を含んだ丁寧で分かりやすい手順書を作成してください。\n1. **はじめに**: (歓迎のメッセージと手順書の目的)\n2. **PCの開封と初期設定**: (電源投入からOSの初期設定まで)\n3. **ネットワーク接続**: (社内Wi-Fiへの接続方法)\n4. **必須ツールのインストールとログイン**: (各ツールのセットアップ手順)\n5. **困ったときの連絡先**: (情シス担当者の連絡先)`
    },
    journal_entry: {
        name: "仕訳サポート",
        fields: [
            { id: 'transaction', label: '取引の内容', type: 'textarea', placeholder: '例：7月1日に、取引先A社への売掛金10万円が普通預金口座に振り込まれた。', required: true },
        ],
        promptTemplate: (data) => `あなたは経理の専門家です。以下の取引内容について、日本の会計基準に基づいた複式簿記の仕訳を提案してください。\n\n# 取引内容\n${data.transaction}\n\n# 出力形式\n借方勘定科目、借方金額、貸方勘定科目、貸方金額、摘要を分かりやすく示してください。\n例:\n(借方) 普通預金 100,000 / (貸方) 売掛金 100,000\n摘要: A社 売掛金入金`
    },
    accounting_report_summary: {
        name: "財務レポート要約作成",
        fields: [
            { id: 'report_text', label: '要約したいレポートのテキスト', type: 'textarea', placeholder: 'ここにP/LやB/Sなどのテキストを貼り付けてください。', required: true },
            { id: 'target_audience', label: '報告対象者', type: 'text', placeholder: '例：経営会議の参加者、営業部門長', required: true },
            { id: 'focus_points', label: '特に注目してほしい点', type: 'text', placeholder: '例：売上高の増減要因、販管費の状況', required: false }
        ],
        promptTemplate: (data) => `あなたは優秀な経営アナリストです。以下の財務レポートを分析し、報告対象者向けに要約を作成してください。\n\n# 元のレポート\n${data.report_text}\n\n# 報告対象者\n${data.target_audience}\n\n# 特に注目すべき点\n${data.focus_points}\n\n# 出力形式\n専門用語を避け、以下の構成で分かりやすいサマリーを作成してください。\n1. **エグゼクティブサマリー**: (全体像を3行程度で)\n2. **主要なポイント**: (注目すべき点を箇条書きで3～5点)\n3. **今後の考察**: (データから読み取れる示唆や、次に確認すべき事項)`
    },
    accounting_closing_checklist: {
        name: "月次決算チェックリスト作成",
        fields: [
            { id: 'closing_month', label: '対象月', type: 'text', placeholder: '例：2024年7月度', required: true },
            { id: 'company_specifics', label: '会社特有のタスク（箇条書き）', type: 'textarea', placeholder: '・Shopify売上データとの突合\n・広告代理店からの請求書確認', required: false }
        ],
        promptTemplate: (data) => `あなたは経験豊富な経理マネージャーです。以下の条件で、${data.closing_month}の月次決算をスムーズに進めるためのチェックリストを作成してください。\n\n# 会社特有のタスク\n${data.company_specifics}\n\n# 出力形式\n一般的な月次決算業務と会社特有のタスクを網羅し、時系列（例：第1週、第2週、月内最終日など）で整理されたチェックリストを作成してください。各項目には担当者が確認できるようチェックボックス (□) を付けてください。`
    }
};
