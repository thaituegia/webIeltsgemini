import type { Cefr, StoredContent } from "../../../shared/types.js";

type Pack = { title: string; topic: string; cefr: Cefr; rule: string; examples: string; rows: string };
// All contexts, distractors, examples and feedback were composed for this bank.
// Four decisions per lesson keep the diagnostic focus narrow rather than padding
// a pack with repeated templates. Grammatical coverage is deliberately cumulative.
const packs: Pack[] = [
{ title: "Describing a room: there is and there are", topic: "Travel", cefr: "A2", rule: "Use there is before a singular countable noun or an uncountable noun. Use there are before a plural noun. Negatives add not, and questions put is or are before there.", examples: "There is a kettle beside the sink. There are three cushions on the sofa.", rows: `
Look at the guesthouse picture: there ___ two lamps beside the bed.|are|is|am|be|Two lamps là danh từ số nhiều, nên dùng there are.
There ___ a small balcony outside our bedroom.|is|are|am|have|A small balcony là số ít, nên dùng there is.
___ there any chairs in the breakfast room?|Are|Is|Does|Has|Câu hỏi với chairs số nhiều dùng Are there.
There ___ any soap in this bathroom. It has all been used.|isn't|aren't|don't|hasn't|Soap không đếm được; phủ định cấu trúc there is thành there isn't.
` },
{ title: "Choosing a or an by sound", topic: "Education", cefr: "A2", rule: "Use a before a consonant sound and an before a vowel sound when introducing a singular countable noun. Sound matters: a university but an hour. Do not put a or an directly before plural nouns.", examples: "The workbook contains a useful diagram. We have an extra hour to finish.", rows: `
The student gave ___ honest answer about the missing homework.|an|a|these|many|Honest bắt đầu bằng âm nguyên âm vì h không phát âm, nên dùng an.
Our class watched ___ useful demonstration of the microscope.|a|an|many|any|Useful bắt đầu bằng âm /j/, nên dùng a dù chữ đầu là u.
He bought ___ umbrella on the way to the college.|an|a|two|much|Umbrella số ít bắt đầu bằng âm nguyên âm, nên dùng an.
There is ___ university on the north side of the city.|a|an|many|several|University bắt đầu bằng âm /j/, nên dùng a university.
` },
{ title: "Plural nouns in a market", topic: "Food", cefr: "A2", rule: "Most countable nouns add -s. Nouns ending in consonant plus y usually change y to -ies; nouns ending in s, sh, ch or x often add -es. Some nouns have irregular plurals, including child/children and person/people.", examples: "The stall sells boxes of cherries. Two children are choosing peaches.", rows: `
The shopper carries two ___ of strawberries.|boxes|boxs|boxies|box|Box kết thúc bằng x, nên số nhiều là boxes.
There are five ___ waiting near the fruit stall.|children|childs|childes|child|Child có số nhiều bất quy tắc là children.
The orchard sells three kinds of ___.|cherries|cherrys|cherryes|cherry|Cherry kết thúc consonant + y, đổi y thành ies: cherries.
Only four ___ can stand behind this narrow counter.|people|person|peopleses|personsies|People là số nhiều thông thường của person trong nghĩa người.
` },
{ title: "Subject and object pronouns", topic: "Community", cefr: "A2", rule: "Subject pronouns come before the verb: I, you, he, she, it, we, they. Object pronouns follow a verb or preposition: me, you, him, her, it, us, them. Choose the pronoun using the person or group it refers to.", examples: "The caretaker knows us. We spoke to her after the activity.", rows: `
My sister and I clean the hall. ___ arrive before the other volunteers.|We|Us|Our|Ours|Nhóm my sister and I là chủ ngữ số nhiều, thay bằng We.
The coordinator thanked Ravi and me. She thanked ___ for staying late.|us|we|our|ours|Sau động từ thanked cần tân ngữ us.
Leila is at reception. Please give ___ this message.|her|she|hers|herselfs|Give nhận tân ngữ chỉ Leila là her.
The keys are on the desk. Can you bring ___ to the caretaker?|them|they|their|theirs|Keys số nhiều làm tân ngữ bring, nên dùng them.
` },
{ title: "Present simple: routines and subject agreement", topic: "Work", cefr: "A2", rule: "Use the present simple for regular actions. With he, she and it, add -s or -es to the main verb. With I, you, we and they, use the base form. Frequency words such as usually often appear before the main verb.", examples: "The receptionist checks the rota every morning. We leave the workshop at five.", rows: `
The caretaker ___ the side gate every weekday.|opens|open|opening|to open|The caretaker là số ít, dùng opens trong present simple.
My colleagues ___ their payslips online each month.|check|checks|checking|to checks|My colleagues số nhiều, nên dùng base form check.
Our supervisor usually ___ the final delivery herself.|watches|watch|watching|to watch|Supervisor số ít; watch thêm es thành watches.
I ___ the handover notes before my shift begins.|read|reads|reading|to reading|Với chủ ngữ I, present simple dùng read, không thêm s.
` },
{ title: "Present simple negatives with do and does", topic: "Health", cefr: "A2", rule: "Use don't plus a base verb with I, you, we and they. Use doesn't plus a base verb with he, she and it. The main verb does not also take -s after doesn't.", examples: "This clinic doesn't open on Sundays. We don't use the lift for one floor.", rows: `
The evening clinic ___ accept appointments after eight.|doesn't|don't|isn't|aren't|Clinic số ít và accept là động từ thường; dùng doesn't accept.
My grandparents ___ drink coffee in the evening.|don't|doesn't|isn't|hasn't|My grandparents số nhiều, nên dùng don't với drink.
She doesn't ___ the tablets without checking the label.|take|takes|taking|took|Sau doesn't dùng base form take, không thêm s.
I ___ need a new prescription this week.|don't|doesn't|amn't|isn't|Chủ ngữ I với động từ need nhận don't.
` },
{ title: "Asking about a service: present simple questions", topic: "Transport", cefr: "A2", rule: "For a present-simple question with an ordinary verb, use do or does before the subject and keep the main verb in the base form. Use does for he, she and it; use do for the other subjects.", examples: "Does this tram stop near the market? Where do passengers buy passes?", rows: `
___ the airport tram run after midnight?|Does|Do|Is|Has|Airport tram là số ít; câu hỏi với run dùng Does.
Where ___ cyclists leave their bicycles at this station?|do|does|is|has|Cyclists số nhiều, nên trợ động từ là do.
Does the ferry ___ vehicles as well as passengers?|carry|carries|carrying|carried|Sau does, động từ giữ base form carry.
What time ___ you normally catch the first bus?|do|does|are|has|Với you và catch trong present simple, dùng do.
` },
{ title: "Present continuous: what is happening now", topic: "Arts", cefr: "A2", rule: "The present continuous uses am, is or are plus an -ing form. It describes an action in progress now. Use am with I, is with a singular subject, and are with a plural subject or you.", examples: "The potter is shaping a bowl. I am sketching the window frame.", rows: `
Listen: the vocalist ___ warming up backstage now.|is|are|am|be|The vocalist số ít; warming up dùng is trong present continuous.
At this moment, two assistants ___ hanging the mural panels.|are|is|am|has|Two assistants số nhiều nhận are.
I am ___ the opening scene right now.|drawing|draw|draws|drawn|Sau am cần -ing form drawing để chỉ hành động hiện tại.
The dancers ___ on stage at the moment; they are waiting in the hall.|aren't rehearsing|doesn't rehearse|isn't rehearse|don't rehearsing|The dancers số nhiều; phủ định continuous là aren't rehearsing.
` },
{ title: "Past simple: regular forms and did", topic: "Travel", cefr: "A2", rule: "A completed action at a finished past time commonly uses the past simple. Regular verbs usually add -ed. In negatives and questions, did or didn't carries the past tense and the main verb stays in its base form.", examples: "We explored the harbour yesterday. Did you book the guided tour?", rows: `
Yesterday we ___ the lighthouse before lunch.|visited|visit|visiting|have visiting|Yesterday là thời gian quá khứ đã kết thúc; visit chuyển thành visited.
The guide didn't ___ the old tunnel during our tour.|mention|mentioned|mentioning|mentions|Sau didn't giữ base form mention.
Did your family ___ at the guesthouse last summer?|stay|stayed|staying|stays|Did mang thì quá khứ, nên stay không thêm ed.
The receptionist ___ our booking number last night.|checked|checks|checking|has checking|Last night đã kết thúc; dùng checked.
` },
{ title: "Past simple: everyday irregular verbs", topic: "Food", cefr: "A2", rule: "Some verbs have irregular past-simple forms: buy/bought, eat/ate, bring/brought and leave/left. Learn these forms in context. They still use a base form after did or didn't.", examples: "The cook brought fresh herbs. We ate outside after the rehearsal.", rows: `
Yesterday Hana ___ a packet of oats at the market.|bought|buyed|buys|buying|Buy có past simple bất quy tắc là bought.
We ___ the lentil stew before the guests arrived.|ate|eated|eats|eating|Eat đổi thành ate trong quá khứ đơn.
My neighbour ___ garlic from her garden yesterday.|brought|bringed|brings|bringing|Bring có dạng quá khứ brought.
The baker ___ the shop at six last evening.|left|leaved|leaves|leaving|Leave trong nghĩa rời đi có past simple left.
` },
{ title: "Have got: describing possessions", topic: "Technology", cefr: "A2", rule: "In British English, have got or has got commonly describes possession. Use has got with he, she or it. Negatives use haven't got or hasn't got; questions invert have or has before the subject.", examples: "My tablet has got a touchscreen. Have you got a travel adapter?", rows: `
This recorder ___ got a built-in microphone.|has|have|is|does|This recorder là số ít nên dùng has got.
We ___ got enough chargers for all six tablets.|have|has|are|do|Chủ ngữ we nhận have got.
___ your laptop got a camera above the screen?|Has|Have|Does|Is|Câu hỏi possession has got với laptop số ít đảo Has lên đầu.
I haven't ___ a spare keyboard in my bag.|got|get|gets|getting|Cấu trúc phủ định possession là haven't got.
` },
{ title: "Possessive determiners before a noun", topic: "Community", cefr: "A2", rule: "Use my, your, his, her, its, our or their directly before a noun to indicate possession. These determiners are not object pronouns or possessive pronouns. Its has no apostrophe when it means belonging to it.", examples: "Our street has a repair club. The centre changed its opening hours.", rows: `
Marta left ___ scarf on the playground bench.|her|she|hers|herself|Trước danh từ scarf cần possessive determiner her.
The children painted ___ names on the plant pots.|their|them|they|theirs|Names cần từ sở hữu đứng trước là their.
My brother and I invited the neighbours to ___ home.|our|us|we|ours|My brother and I tương ứng we; từ sở hữu trước home là our.
The centre has changed ___ evening timetable.|its|it's|it|itself|Its chỉ sở hữu; it's viết tắt it is hoặc it has.
` },
{ title: "Comparing simple qualities", topic: "Transport", cefr: "A2", rule: "Many short adjectives add -er for comparison: small/smaller. Longer adjectives often take more. Use than to introduce the comparison. Good becomes better, and bad becomes worse.", examples: "The tram is quieter than the old bus. The newer path is more comfortable.", rows: `
This cycle route is ___ than the steep hill route.|shorter|shortest|more short|short|Đang so hai tuyến và có than, nên short thành shorter.
The new seats are ___ comfortable than the wooden ones.|more|most|mucher|many|Comfortable dài nên so sánh hơn dùng more comfortable.
Our new connection is ___ than last month's unreliable service.|better|gooder|best|good|Good có comparative bất quy tắc better.
The footpath is wider ___ it was before the repairs.|than|then|that|as|Than nối phần so sánh, không phải then chỉ thời gian.
` },
{ title: "Choosing the extreme: superlatives", topic: "Science", cefr: "A2", rule: "Use the plus a superlative to identify an extreme within a stated group. Short adjectives often take -est, longer ones often take most. Big becomes biggest, and good becomes best.", examples: "This is the tallest seedling in the tray. The final diagram is the most detailed.", rows: `
Of the four lenses, this is the ___ one.|smallest|smaller|more small|small|So với toàn nhóm bốn lens cần superlative smallest.
This is ___ most accurate balance in the room.|the|a|an|some|Superlative với most trong ngữ cảnh xác định thường có the.
That jar holds the ___ sample of all six.|biggest|biger|more big|big|Big gấp đôi g trước est thành biggest.
Her final explanation was the ___ in the group.|best|better|goodest|more good|Good có superlative bất quy tắc best.
` },
{ title: "Present perfect: experience without a finished date", topic: "Travel", cefr: "B1", rule: "Use have or has plus a past participle to discuss experience up to now without naming a finished past time. Ever and never often occur in experience questions or statements. Been to describes a completed visit; gone to often means the person is away.", examples: "Have you ever crossed the channel by ferry? She has been to the island twice and is home now.", rows: `
Have you ever ___ in a mountain homestay?|stayed|stay|staying|stays|Sau have trong present perfect cần past participle stayed.
No date is specified: I ___ visited a working lighthouse before.|have never|did never to|am never|was never to|Trải nghiệm đến hiện tại không kèm thời gian quá khứ đã xong dùng have never visited.
Tomas is back in town now. He has ___ to the coastal village twice.|been|went|going|go|Đã đi và về dùng has been to; sau has cần past participle.
Mina is not here; she has ___ to collect the boarding passes.|gone|go|went|goes|Mina chưa ở đây vì đã đi nhận thẻ; has gone phù hợp trạng thái vắng mặt và dùng past participle.
` },
{ title: "Present perfect: an unfinished period", topic: "Work", cefr: "B1", rule: "The present perfect can count completed events in a period that still continues, such as so far this week. Use have or has plus a participle. Already commonly marks earlier completion, while yet often appears in questions and negatives.", examples: "So far today, we have processed nine invoices. The courier hasn't arrived yet.", rows: `
It is still Monday morning. So far today, we ___ three induction sessions.|have held|held yesterday|had holding|are hold|So far today là khoảng còn tiếp diễn, dùng have held.
The technician has ___ repaired the microphone; you can use it now.|already|yet|tomorrow|since|Already dùng trong khẳng định cho việc đã hoàn tất sớm hơn dự kiến.
We haven't received the handover report ___.|yet|already tomorrow|ever ago|since of|Phủ định present perfect thường dùng yet để chỉ chưa đến lúc này.
___ the supervisor checked the new rota yet?|Has|Did have|Is|Does have|Câu hỏi present perfect với supervisor số ít là Has ... checked.
` },
{ title: "Finished dates versus a connection to now", topic: "Arts", cefr: "B1", rule: "Use past simple with finished past times such as in 2022 or last night. Use present perfect for a result connected to now when no finished time is stated. Do not combine a finished date with a normal present-perfect statement.", examples: "The mural opened in 2021. The artist has added a new panel, so the design looks different now.", rows: `
The ensemble ___ its first recital in 2020.|gave|has given|has giving|gives since|In 2020 là thời điểm đã xong, nên dùng gave.
Look at the wet wall: the artist ___ just painted the final stripe.|has|did to|is to|was to|Just và kết quả hiện tại phù hợp has painted.
I ___ the exhibition last Friday.|visited|have visited|have visiting|visit since|Last Friday yêu cầu past simple visited.
No finished date is given: We ___ all the tickets, so the concert is sold out.|have sold|sold next week|had selling|are sell|Kết quả hiện tại sold out và không có mốc quá khứ hoàn tất phù hợp have sold.
` },
{ title: "Past continuous: the background to an event", topic: "Community", cefr: "B1", rule: "Use was or were plus -ing for an activity in progress at a past moment. A shorter event interrupting it often takes past simple. Was agrees with singular subjects and I; were agrees with plural subjects and you.", examples: "The tenants were discussing repairs when the power failed. I was stacking chairs at that moment.", rows: `
At half past seven yesterday, the residents ___ discussing the playground plan.|were|are|have|be|Residents số nhiều và có mốc quá khứ, dùng were discussing.
I ___ the noticeboard when the caretaker called my name.|was reading|read tomorrow|am reading|have reading|Hành động nền đang diễn ra trong quá khứ dùng was reading.
While Noor ___ the floor, a neighbour brought extra brushes.|was cleaning|is cleaning|has cleaning|will cleaning|Was cleaning làm nền cho sự kiện brought trong quá khứ.
The children ___ in the courtyard when the sudden rain began.|were playing|are playing|have played now|will be playing|Were playing diễn đạt hoạt động bị mưa bắt đầu xen vào.
` },
{ title: "Be going to: plans and visible evidence", topic: "Environment", cefr: "B1", rule: "Use am, is or are going to plus a base verb for an intention already formed or a prediction based on present evidence. Keep going to intact and choose be to agree with the subject.", examples: "We are going to count the saplings tomorrow. That loose branch is going to fall.", rows: `
We have already agreed on a date: we ___ going to plant the hedge on Saturday.|are|is|am|have|We nhận are; kế hoạch đã thống nhất dùng are going to.
Look at the leaning pot: it is going to ___.|fall|fell|falling|falls|Sau going to cần base verb fall.
The ecologist ___ going to compare the two peat samples tomorrow.|is|are|am|does|Ecologist số ít nên is going to.
I have bought the seeds because I ___ going to create a pollinator border.|am|is|are|have|I nhận am trong cấu trúc am going to.
` },
{ title: "Will: offers and decisions made now", topic: "Technology", cefr: "B1", rule: "Will plus a base verb can express an offer or a decision made at the moment of speaking. It also commonly expresses a prediction. In a question, will comes before the subject. Do not add -s to a verb after will.", examples: "The projector is heavy; I will carry it for you. Will you save a copy before closing?", rows: `
The visitor cannot find the link. You decide now: I ___ send it to you.|will|am yesterday|had to yesterday|was|Lời quyết định ngay lúc nói phù hợp I will send.
Don't lift both boxes; I will ___ the second one.|carry|carries|carrying|carried|Sau will giữ base verb carry.
___ you help me check the spreadsheet later?|Will|Did will|Does will|Has will|Câu hỏi với will đảo trực tiếp Will you.
The screen has frozen. You offer help now: I ___ restart the application for you.|will|did|had|was|Will diễn đạt lời đề nghị làm ngay, không dùng các trợ động từ quá khứ.
` },
{ title: "Permission and necessity: can, must and have to", topic: "Health", cefr: "B1", rule: "Can often asks or gives permission. Must expresses a strong requirement, and mustn't prohibits. Don't have to means something is not necessary, not prohibited. Modal verbs are followed by a base verb.", examples: "You mustn't block the clinic doorway. You don't have to bring your own blanket because one is provided.", rows: `
The rule forbids it: visitors ___ smoke anywhere inside the clinic.|mustn't|don't have to|may|can|Mustn't nêu cấm; don't have to chỉ không cần.
Blankets are supplied, so you ___ bring one yourself.|don't have to|mustn't|can't|must|Không cần vì được cấp sẵn dùng don't have to.
___ I use this chair while waiting? I am asking permission.|Can|Must to|Have|Did to|Can I là cách hỏi xin phép tự nhiên.
Staff must ___ their identification badges on duty.|wear|wears|wearing|wore|Must là modal, theo sau base verb wear.
` },
{ title: "Should: useful advice rather than an obligation", topic: "Food", cefr: "B1", rule: "Should plus a base verb gives advice or an expectation. Shouldn't advises against an action. It is generally weaker than must when giving a requirement. Questions use should before the subject.", examples: "You should check the food label. Should we let the stew cool before storing it?", rows: `
For a less salty taste, you ___ add all the seasoning at once.|shouldn't|don't should|shouldn't to|shoulds not|Shouldn't + base verb add cho lời khuyên không làm.
You should ___ the oats according to the package instructions.|cook|cooks|cooking|cooked|Should cần base verb cook.
___ we separate the dressing from the salad until serving?|Should|Do should|Have should|Are should|Câu hỏi modal đảo Should we.
This is advice, not a strict rule: You ___ compare portion sizes before choosing.|should|mustn't|can't|don't have to not|Should phù hợp sắc thái lời khuyên đã nêu.
` },
{ title: "Real conditions: general facts and possible futures", topic: "Science", cefr: "B1", rule: "A zero conditional often uses present simple in both clauses for general relationships. A first conditional normally uses if plus present simple and will plus a base verb for a possible future result. Do not put ordinary predictive will in the if-clause.", examples: "If a metal expands, its dimensions change. If the balance is available tomorrow, we will weigh the samples.", rows: `
General rule: If water reaches its boiling point at the stated pressure, it ___.|boils|will boiled|boiled yesterday|is boil|General relationship dùng present simple boils.
If the lens ___ tomorrow, we will repeat the observation.|arrives|will arrives|arrived yesterday|is arrived will|If-clause nói điều kiện tương lai dùng present simple arrives.
If we collect enough data next week, we ___ the comparison.|will make|made|had make|making|Kết quả có thể xảy ra trong tương lai dùng will make.
If you ___ the powder thoroughly, it disperses more evenly.|stir|will stirs|stirred tomorrow|have stirring|Mệnh đề điều kiện cho quy luật hiện tại dùng stir.
` },
{ title: "Imagining an unlikely present: second conditional", topic: "Finance", cefr: "B1", rule: "Use if plus past form and would plus base verb to imagine an unreal or unlikely present or future. The past form marks distance from reality, not necessarily past time. Were is common after if I or if he in formal hypothetical statements.", examples: "If I had a larger emergency fund, I would worry less. If she were the treasurer, she would publish clearer accounts.", rows: `
I do not own the shop: If I owned it, I ___ change the payment system.|would|will yesterday|had|did to|Điều kiện giả định hiện tại dùng would + base verb.
If our budget ___ larger, we would replace the old chairs.|were|will be|is yesterday|has|Giả định không có thật ở hiện tại dùng past form were.
If I had more savings, I would ___ a longer course.|take|took|taking|takes|Sau would dùng base verb take.
If she ___ the treasurer, she would check each invoice herself.|were|will|has|being|Were phù hợp mệnh đề giả định với she.
` },
{ title: "Defining relatives: identifying the person or thing", topic: "Work", cefr: "B1", rule: "A defining relative clause identifies which person or thing is meant and normally has no separating commas. Use who for people, which for things, and whose for possession. That can replace who or which in many defining clauses, but not whose.", examples: "The worker who repairs the lift is here. The desk whose drawer is broken has been labelled.", rows: `
The employee ___ designed the rota has moved to another team.|who|which|whose|where|Employee là người và relative làm chủ ngữ designed, dùng who.
This is the machine ___ cuts the fabric automatically.|which|who|whose|when|Machine là vật, dùng which làm chủ ngữ cuts.
I spoke to the applicant ___ portfolio you recommended.|whose|who|which|where|Portfolio thuộc applicant, nên dùng whose + noun.
Choose the defining relative: The room ___ we use for training is upstairs.|that|who|whose|when|Room là vật; that làm tân ngữ use trong defining clause.
` },
{ title: "After a preposition: choosing an -ing form", topic: "Arts", cefr: "B1", rule: "When a verb follows a preposition such as after, before, without or by, use its -ing form. In be interested in and look forward to, in and to are prepositions and also take a noun or -ing form.", examples: "The artist left without signing the sketch. We improved the design by testing several versions.", rows: `
The vocalist warmed up before ___ onto the stage.|going|go|went|to go|Before là giới từ trước động từ, dùng going.
She is interested in ___ murals for public spaces.|painting|paint|to paint|painted|Interested in nhận gerund painting.
We look forward to ___ your new ensemble.|hearing|hear|to hear|heard|To trong look forward to là giới từ, theo sau hearing.
The artist improved the sketch by ___ the proportions.|checking|check|to check|checked|By nêu cách làm và nhận checking.
` },
{ title: "Infinitive of purpose: explaining why", topic: "Environment", cefr: "B1", rule: "Use to plus a base verb or in order to plus a base verb to state a purpose. The negative is in order not to or so as not to. A purpose infinitive differs from a because-clause explaining a cause.", examples: "We fenced the saplings to keep deer away. The team worked quietly in order not to disturb nesting birds.", rows: `
The volunteers added mulch ___ retain moisture around the saplings.|to|for retain|because retain|so retain|To + base verb retain nêu mục đích.
We used a footpath in order not ___ damage the moss.|to|for|that|of|Cấu trúc phủ định mục đích là in order not to + verb.
The ecologist installed a camera to ___ nocturnal activity.|record|recording|records|recorded|To nêu mục đích cần base verb record.
They moved the marker so as ___ block the animal burrow.|not to|to not be|don't|not for|So as not to + base verb diễn đạt mục đích tránh cản trở.
` },
{ title: "Present passive: focusing on a process", topic: "Food", cefr: "B1", rule: "The present-simple passive uses am, is or are plus a past participle. It focuses on what happens to a subject rather than who acts. A by-phrase can name the agent when relevant.", examples: "The oats are packed in paper bags. Each jar is checked before dispatch.", rows: `
At this factory, each batch ___ tested before it leaves.|is|are|has|does|Each batch số ít; passive dùng is tested.
The lentils are ___ in sealed containers.|stored|store|storing|stores|Sau are trong passive cần past participle stored.
All the food labels ___ printed on recycled paper.|are|is|has|does|Food labels số nhiều nhận are printed.
The final products are checked ___ a trained inspector.|by|from|with of|to|By giới thiệu agent trong passive.
` },
{ title: "Perfect continuous: duration and visible activity", topic: "Community", cefr: "B2", rule: "Have or has been plus -ing describes continuing or recently repeated activity. For introduces a duration and since a starting point. Stative verbs such as know normally use the simple perfect, not the continuous.", examples: "The residents have been collecting signatures since March. I have known the caretaker for a decade.", rows: `
The playground is still unfinished. We ___ repairs for three weeks.|have been organising|organise yesterday|had organise|are organised|For three weeks và still unfinished nối hoạt động tới hiện tại, dùng have been organising.
Her gloves are muddy because she ___ the new border.|has been planting|plants tomorrow|had plant|was plant|Dấu vết hiện tại của hoạt động gần đây phù hợp has been planting.
Use the normal stative form: I ___ the committee chair since 2017.|have known|have been knowing|am knowing|know yesterday|Know thường là stative, nên have known.
The residents have been meeting regularly ___ the hall reopened.|since|for|during of|ago|Mệnh đề the hall reopened nêu mốc bắt đầu, nên since.
` },
{ title: "Past perfect: clarifying an earlier event", topic: "Transport", cefr: "B2", rule: "Had plus a past participle marks completion before another past reference point. It is useful when recounting events out of sequence. Already can appear between had and the participle.", examples: "The ferry had departed before our taxi reached the pier. The inspector discovered that a sensor had failed.", rows: `
By the time we reached the tram stop, the last tram ___ left.|had|has|is|does|Tram rời trước mốc reached trong quá khứ, dùng had left.
The driver realised that she ___ the wrong slip road earlier.|had taken|takes|will take|is taking|Earlier đi trước realised, nên had taken.
When the repair team arrived, the workers had already ___ the barrier.|removed|remove|removing|removes|Sau had already cần past participle removed.
The signal failed because the cable ___ been damaged during the earlier work.|had|will|is|does|Bị hỏng trước failed dùng past perfect passive had been damaged.
` },
{ title: "Future perfect: looking back from a deadline", topic: "Education", cefr: "B2", rule: "Will have plus a past participle presents an action as complete by a future reference point. By marks a latest completion time. In a future time clause beginning by the time, use a present form rather than ordinary will.", examples: "By July, the students will have submitted every portfolio. By the time the term ends, the tutors will have marked them.", rows: `
By next Thursday, the tutor ___ all the oral presentations.|will have assessed|assessed yesterday|is assess|had assessing|Hạn tương lai by next Thursday dùng will have assessed.
The class will have ___ the workbook before the revision week starts.|completed|complete|completing|completes|Will have cần past participle completed.
By the time the guest lecturer ___ tomorrow, we will have prepared our questions.|arrives|will arrives|had arrive|arriving|Future time clause dùng present simple arrives.
In December, she ___ the mentoring scheme for exactly two years.|will have led|led last month|has leading|was lead|Nhìn lại từ mốc tương lai December dùng will have led.
` },
{ title: "Past and continuous passives", topic: "Technology", cefr: "B2", rule: "Past-simple passive uses was or were plus a past participle. Present-continuous passive uses am, is or are being plus a past participle. These forms describe completed past treatment or ongoing current treatment of a subject.", examples: "The file was converted yesterday. The server is being inspected now.", rows: `
Yesterday the damaged microphone ___ replaced.|was|is being now|has being|does|Yesterday đặt passive ở quá khứ: was replaced.
The computers are unavailable because they ___ right now.|are being updated|were update|have updating|are update|Hành động đang tiến hành hiện tại dùng are being updated.
The two archives ___ checked before the upload last night.|were|was|is|are being tomorrow|Two archives số nhiều, passive quá khứ dùng were checked.
The patch is being ___ on a separate machine at the moment.|tested|test|testing|tests|Passive continuous is being cần past participle tested.
` },
{ title: "Third conditional: an alternative past", topic: "Travel", cefr: "B2", rule: "Use if plus had and a past participle, followed by would have plus a past participle, for an unreal past condition and result. Both clauses describe events that did not happen as imagined.", examples: "If we had checked the tide table, we would have chosen another ferry. If the hostel had replied, we would have booked earlier.", rows: `
We missed the crossing. If we had left earlier, we ___ caught the ferry.|would have|will have|would to|had to|Không bắt được ferry trong quá khứ, kết quả giả định dùng would have caught.
If the guesthouse ___ warned us, we would have brought a travel adapter.|had|has|will|is|Điều kiện trái thực quá khứ dùng had warned.
If I had read the itinerary, I would have ___ the correct walking shoes.|packed|pack|packing|packs|Would have cần past participle packed.
They did not book ahead. If they ___ booked, they would have secured a room.|had|would|will|are|If-clause trong third conditional là had booked.
` },
{ title: "Mixed conditional: a past choice with a present result", topic: "Work", cefr: "B2", rule: "For an unreal past condition with a present result, use if plus had and a past participle, then would plus a base verb. Time words such as now help distinguish this from a third conditional describing a past result.", examples: "If I had accepted the transfer, I would work at the coastal branch now. If she had missed induction, she would not know the procedure today.", rows: `
If I had kept the old role, I ___ still work night shifts now.|would|would have to had|will yesterday|had|Now chỉ kết quả hiện tại từ điều kiện quá khứ, dùng would work.
She would understand the rota now if she ___ attended the induction last week.|had|has|will|is|Điều kiện đã không xảy ra tuần trước dùng had attended.
If the team had documented the handover, we would ___ the missing details today.|know|known|knowing|knew|Kết quả hiện tại trong mixed conditional dùng would + know.
We did not hire a coordinator. If we had done so, the project ___ be better organised now.|would|would have been to|had|was|Kết quả giả định hiện tại dùng would be, không would have been.
` },
{ title: "Reported statements from a later viewpoint", topic: "Science", cefr: "B2", rule: "When reporting later with a past reporting verb, present tenses often shift back and will becomes would. Pronouns and time expressions must match the reporter's viewpoint. Tell normally needs a person object; say can directly introduce a that-clause.", examples: "The researcher said that the lens was clean. The assistant told us that she would repeat the measurement the next day.", rows: `
On Monday he said, 'I will label the jars tomorrow.' Reporting a week later: He said he ___ label them the following day.|would|will to|had will|was will|Will lùi thành would theo mốc thuật lại muộn hơn.
The scientist ___ us that the samples were ready.|told|said|spoke|talked|Told nhận tân ngữ người us; said us không chuẩn.
Earlier Mira said, 'My experiment is finished.' Later: Mira said that ___ experiment was finished.|her|my|your|their own|My trong lời Mira thành her khi người khác thuật lại.
Yesterday the assistant said, 'I have cleaned the lens.' Later: The assistant said that she ___ cleaned the lens.|had|has to|is|would to|Present perfect thường backshift sang past perfect had cleaned.
` },
{ title: "Reported questions: order and reference", topic: "Finance", cefr: "B2", rule: "Reported questions use statement word order, not direct-question inversion. Keep a wh-word or use if/whether for a yes-no question. A past reporting context may require backshift and changed pronouns.", examples: "The clerk asked whether I needed a receipt. She asked where the invoice had been sent.", rows: `
He asked, 'What is the invoice number?' Later: He asked what the invoice number ___.|was|did be|was it|does|Embedded question giữ subject trước verb và lùi is thành was.
The adviser asked ___ I had a savings account.|whether|where|whose|what of|Yes-no question được đưa vào bằng whether.
Choose correct reported word order: She asked ___.|when the payment had arrived|when had the payment arrived|when did the payment had arrived|when arrived had the payment|Không đảo trợ động từ trong reported question; subject payment trước had.
The clerk asked, 'Can you show the invoice?' Later: The clerk asked if I ___ show it.|could|can to|had can|was can|Can thường backshift thành could trong ngữ cảnh quá khứ.
` },
{ title: "Non-defining relatives: adding extra information", topic: "Environment", cefr: "B2", rule: "A non-defining relative adds extra information about an already identified noun and is separated by commas. Use who, which or whose; do not normally use that. Which can also refer to the preceding proposition.", examples: "The oak, which is over a century old, shades the square. The ecologist returned early, which surprised the team.", rows: `
Our oak tree, ___ stands beside the gate, survived the storm.|which|that|what|where|Non-defining clause sau dấu phẩy chỉ vật dùng which, không that.
Dr Patel, ___ research concerns peatlands, will speak first.|whose|who|which|that|Research thuộc Dr Patel, nên whose research.
The reserve closed for repairs, ___ disappointed the visiting group.|which|that|who|whose|Which tham chiếu toàn sự kiện trước đó và thêm nhận xét.
The ranger, ___ has worked here for twenty years, knows every trail.|who|that|what|whose|Người với non-defining relative dùng who và dấu phẩy.
` },
{ title: "Active participle clauses: keeping the subject clear", topic: "Arts", cefr: "B2", rule: "An -ing participle clause can shorten an active clause when its understood subject is the same as the main clause's subject. It can express background, reason or simultaneous action. Avoid a dangling participle whose subject does not match.", examples: "Holding the sketch at arm's length, the artist checked its proportions. Knowing the venue well, the ensemble needed little rehearsal.", rows: `
___ the score carefully, the pianist marked the difficult passage.|Reading|Readed|To having read|Was read|Reading có chủ ngữ hiểu là the pianist và hành động chủ động.
Choose the sentence without a dangling participle.|Walking into the studio, I noticed the new mural.|Walking into the studio, the mural caught my eye.|Walking into the studio, the wall was red.|Walking into the studio, the lights seemed bright.|I là người walking; các chủ ngữ mural, wall, lights không đi vào studio.
___ the audience had arrived, the stage manager started the announcement.|Knowing|Known|Knowed|Was know|Stage manager là người biết, nên active participle Knowing.
Holding a pencil, the artist ___ the outline slowly.|traced|were traced|is being trace|had tracing|Artist vừa holding vừa chủ động traced; chọn dạng main verb chuẩn.
` },
{ title: "Causative have and get: arranging another person's work", topic: "Travel", cefr: "B2", rule: "Have/get plus object plus past participle describes arranging for someone else to do something. Get plus a person plus to-infinitive describes persuading or arranging that person's action. Distinguish these from doing the work yourself.", examples: "We had our travel bags repaired. The host got a driver to collect the guests.", rows: `
We paid a technician: We had the travel adapter ___.|checked|check|checking|checks|Have + object + past participle checked nói nhờ người khác kiểm tra.
The guesthouse got a plumber ___ repair the sink.|to|for|that|of|Get + người + to-infinitive: got a plumber to repair.
Choose the meaning of 'She had her suitcase repaired'.|She arranged for someone to repair it.|She necessarily repaired it herself.|She bought a new suitcase.|She refused any repair.|Causative have diễn đạt thu xếp người khác thực hiện.
Before the trip, I will get my passport photos ___.|taken|take|taking|takes|Get + vật + past participle taken cho việc nhờ chụp.
` },
{ title: "Modal deductions about the past", topic: "Community", cefr: "B2", rule: "Must have plus a participle expresses a strong deduction about the past. Might/may have expresses possibility. Can't have expresses a deduction of impossibility. These meanings differ from an obligation to do something.", examples: "The hall is spotless; someone must have cleaned it. The key might have fallen behind the desk.", rows: `
The hall was locked all night and the seal is intact. The visitor ___ entered through that door.|can't have|must to|has must|might to|Dữ kiện loại khả năng đã vào qua cửa, dùng can't have entered.
The floor is wet and the mop is out. Someone ___ cleaned it recently.|must have|must to|is must|has to had|Suy luận mạnh về quá khứ dùng must have cleaned.
We are unsure: The caretaker ___ left the keys in the office.|might have|must to|is might|has might|Chỉ khả năng chưa chắc dùng might have left.
The lights were on when I arrived. Someone must have ___ them on earlier.|switched|switch|switching|switches|Must have yêu cầu past participle switched.
` },
{ title: "Wish: changing a present situation or regretting a past action", topic: "Education", cefr: "B2", rule: "Wish plus a past form describes an unreal present situation. Wish plus had and a participle expresses regret about the past. Wish plus would can express a desired change in another person's behaviour; it is not the usual form for a past regret.", examples: "I wish the seminar were shorter. She wishes she had saved her notes before closing the file.", rows: `
I did not save my draft yesterday. I wish I ___ saved it.|had|have|would to|am|Tiếc hành động quá khứ dùng wish + past perfect had saved.
The room is noisy now. I wish it ___ quieter.|were|will|has|had been tomorrow|Tình huống hiện tại trái mong muốn dùng past form were.
My classmates keep interrupting. I wish they ___ wait until the speaker finishes.|would|had to yesterday|have|are|Mong thay đổi hành vi lặp lại của người khác dùng wish + would.
She took the wrong module last term. She wishes she had ___ the advice more carefully.|read|reading|reads|to read|Sau had cần past participle read; hình thức viết trùng base nhưng phát âm /red/.
` },
{ title: "Qualifying comparisons: much, slightly and nowhere near", topic: "Transport", cefr: "B2", rule: "Comparatives can take modifiers such as much, far, slightly or a little. Very does not normally directly modify a comparative. As plus adjective plus as expresses equality; nowhere near as ... as emphasises a large inequality.", examples: "The new tram is much quieter. The morning journey is nowhere near as crowded as the evening one.", rows: `
The new route is ___ faster than the old one, saving almost an hour.|much|very|most|more much|Much có thể nhấn comparative faster; very faster không chuẩn.
There is only a small difference: this path is ___ wider.|slightly|very|most|as of|Slightly thể hiện chênh lệch nhỏ trước comparative.
The rural bus is nowhere near ___ frequent as the city service.|as|than|more|most|Cấu trúc là nowhere near as + adjective + as.
Both trips take forty minutes. One is as long ___ the other.|as|than|that|to|So bằng dùng as long as.
` },
{ title: "Negative adverbials: inversion for emphasis", topic: "Science", cefr: "C1", rule: "When a negative or restrictive adverbial such as never, rarely or at no time starts a clause for emphasis, invert an auxiliary and the subject. If there is no auxiliary, add do, does or did. The main verb remains in the base form after do-support.", examples: "Rarely do these organisms survive outside water. At no time did the researcher alter the recorded data.", rows: `
Never before ___ such a clear diffraction pattern.|had we observed|we had observed|we observed had|observed we had|Never before đầu câu kích hoạt đảo had trước we.
Rarely ___ this instrument require recalibration.|does|is to|has to|did to|Present simple với require dùng đảo does trước chủ ngữ số ít.
At no time did the team ___ the unprocessed readings.|discard|discarded|discarding|discards|Sau did-support, main verb là base form discard.
Choose the correct emphatic inversion.|Seldom has a result challenged the model so directly.|Seldom a result has challenged the model so directly.|Seldom has challenged a result the model so directly.|Seldom a result challenged has the model so directly.|Seldom đầu clause yêu cầu auxiliary has trước subject a result.
` },
{ title: "Only clauses: where inversion belongs", topic: "Finance", cefr: "C1", rule: "Fronted only after, only when, only by or only then can trigger inversion in the main clause. Do not invert inside an ordinary subordinate clause after when. Only modifying the subject does not by itself trigger inversion.", examples: "Only after the invoice arrived did we discover the extra charge. Only the treasurer knew the password.", rows: `
Only after checking the invoice ___ the duplicate charge.|did she notice|she did notice|noticed she did|she noticed did|Only after đầu câu đảo did she ở main clause.
Only when the bank ___ the error did the payment go through.|corrected|did corrected|corrected did|does corrected|When-clause giữ thứ tự bình thường bank corrected; đảo chỉ main clause.
Only the senior accountant ___ the final adjustment.|approved|did approved|approved did|does approved|Only bổ nghĩa subject không kích hoạt đảo; approved là động từ chuẩn.
Only by reducing the unit cost ___ the project remain viable.|could|it could|it can to|was to|Sau fronted Only by, đảo modal could trước subject the project.
` },
{ title: "It-clefts: putting one element in focus", topic: "Arts", cefr: "C1", rule: "An it-cleft commonly uses It is/was plus a focused element plus that/who and a clause. It highlights contrast without losing the original clause's argument structure. The pronoun it does not refer to a previously named object in this pattern.", examples: "It was the lighting that transformed the scene. It is the vocalist who introduces the ensemble.", rows: `
It was the final colour change ___ drew my attention to the mural.|that|what|which of|whose|It-cleft dùng focused phrase rồi that-clause.
Focus on time: ___ in the second rehearsal that the ensemble found the right balance.|It was|There was|What was|That it|It was + thời gian + that là cấu trúc cleft chuẩn.
Choose a grammatical cleft focusing on the person.|It was Leena who designed the stage setting.|It Leena was who designed the stage setting.|It was who Leena designed the stage setting.|It was Leena what the stage designed setting.|It was Leena who giữ cấu trúc và vai trò subject của designed.
It is the texture, rather than the size, that ___ this sculpture distinctive.|makes|make|making|to make|Relative subject tương ứng texture số ít, nên makes.
` },
{ title: "What-clefts: focusing a result or action", topic: "Education", cefr: "C1", rule: "A pseudo-cleft can use a what-clause as subject followed by be and a focused complement. What I need is a clearer example. When what-clause contains do, the complement commonly uses a bare or to-infinitive. Keep the what-clause in statement order.", examples: "What the students requested was more detailed feedback. What the tutor did was explain the rubric again.", rows: `
What the class needs ___ a chance to practise before assessment.|is|are to|being|have|What-clause toàn bộ làm chủ ngữ số ít, dùng is.
Choose the correct what-clause word order.|What the lecturer recommended was a narrower topic.|What did the lecturer recommend was a narrower topic.|What recommended the lecturer was a narrower topic.|What the lecturer was recommended a narrower topic.|Pseudo-cleft dùng statement order the lecturer recommended.
What the tutor did was ___ the instructions in simpler language.|restate|restates|restated|restating|Sau what ... did was, bare infinitive restate là dạng tự nhiên.
___ surprised us was the depth of the students' questions.|What|That what|Which did|There|What-clause làm chủ ngữ diễn đạt điều khiến bất ngờ.
` },
{ title: "Concession across different clause shapes", topic: "Environment", cefr: "C1", rule: "Although and even though introduce finite clauses. Despite and in spite of take a noun phrase or -ing form. Albeit can introduce a reduced concession such as albeit slowly. Do not add but to the same although construction.", examples: "Although the ground was dry, the saplings survived. The reserve expanded, albeit gradually.", rows: `
___ the severe drought, the mature hedge remained green.|Despite|Although|Even though|Despite of|Noun phrase the severe drought nhận Despite, không despite of.
Although the survey was limited, ___ provided useful baseline observations.|it|but it|despite it|although it|Although đã đánh dấu nhượng bộ; main clause không thêm but.
The wetland recovered, ___ more slowly than the team had expected.|albeit|despite of|in spite|whereas of|Albeit nhận reduced clause more slowly ... .
In spite of ___ several plots to flooding, the team retained enough data.|losing|lose|lost|to lose|Sau in spite of dùng -ing form losing.
` },
{ title: "Nominalisation: preserving grammatical roles", topic: "Work", cefr: "C1", rule: "Nominalisation turns an action or quality into a noun, often changing how participants are expressed: the managers reviewed the scheme becomes the managers' review of the scheme. Determiners and prepositions must fit the new noun phrase; nominalisation can obscure agency if used carelessly.", examples: "The team's evaluation of the rota revealed a gap. The rapid expansion of the service created coordination problems.", rows: `
The systematic ___ of handover errors led to a revised checklist.|analysis|analyse|analysing to|analytically|The systematic cần danh từ analysis làm head của noun phrase.
The committee's approval ___ the leave policy was recorded in the minutes.|of|to approving|for approve|that of|Danh từ approval nối đối tượng được duyệt bằng of.
Choose the grammatical nominalisation of 'The supervisors reviewed the schedule'.|The supervisors' review of the schedule|The supervisors reviewed of the schedule|The supervisors' reviewing to the schedule|The schedule reviewed the supervisors'|Noun review nhận possessive agent và of + object.
Rapid ___ of the team made informal communication less effective.|expansion|expand|expansively|expanded to|Adjective Rapid cần danh từ expansion để làm chủ ngữ.
` },
{ title: "Formal recommendations: the mandative subjunctive", topic: "Health", cefr: "C1", rule: "In a formal mandative pattern after recommend, insist or essential, a that-clause can use the base verb, including be, regardless of subject. British English also permits should plus base verb. Avoid mixing the base pattern with ordinary third-person -s.", examples: "The panel recommended that the clinic extend its opening hours. It is essential that the information be accurate.", rows: `
Use the formal base-form subjunctive: The panel recommended that each participant ___ informed of the options.|be|is|was|being|Mandative subjunctive giữ base form be dù subject số ít.
The adviser insisted that the clinic ___ a written procedure. Use the base-form pattern.|adopt|adopts|adopted yesterday|adopting|That-clause mandative với yêu cầu dùng adopt, không adopts.
It is essential that the records ___ accessible to the authorised team. Use the formal subjunctive.|remain|remains|remaining|to remain|Base-form mandative dùng remain.
Choose a valid British should-pattern.|The panel recommended that the leaflet should explain the risks clearly.|The panel recommended that the leaflet should explains the risks clearly.|The panel recommended that the leaflet should explained the risks clearly.|The panel recommended that the leaflet should to explain the risks clearly.|Should-pattern cần base verb explain.
` },
{ title: "Hedging: matching grammar to justified certainty", topic: "Science", cefr: "C1", rule: "Academic hedging can use may, appears to, seems to or is likely to. Modal verbs take a base verb; appears/seems takes a to-infinitive. A hedge lowers certainty but does not replace evidence or justify an unsupported causal claim.", examples: "The pattern may reflect a sampling difference. The discrepancy appears to arise from the measurement procedure.", rows: `
The observed change may ___ from variation in sample temperature.|result|results|resulting|resulted|May là modal, theo sau base form result.
The effect appears ___ stronger in the older subgroup.|to be|be|being|is|Appears cần to-infinitive to be.
The model is likely ___ underestimate uncertainty under these assumptions.|to|that to|for to|of|Likely + to-infinitive là cấu trúc chuẩn.
Choose the cautious claim that the limited data can support.|The association may indicate a relationship, but causation remains uncertain.|The association proves causation beyond doubt.|The association necessarily eliminates every alternative explanation.|The association guarantees the same result in all populations.|May và mệnh đề hạn chế phù hợp dữ liệu giới hạn; các lựa chọn khác tuyệt đối hóa.
` },
{ title: "Quantifier scope: not all and none", topic: "Community", cefr: "C1", rule: "Not all means some members do not meet a condition, while none means no members meet it. Both, either and neither differ in scope for a pair. The position of only changes what a statement excludes, so preserve the intended focus.", examples: "Not all residents attended means at least some did not attend. Neither proposal was accepted means both proposals were rejected.", rows: `
'Not all households received the leaflet' means ___.|at least some households did not receive it|no household received it|every household received it|exactly one household received it|Not all phủ định việc tất cả đều nhận; không đủ thông tin để kết luận none hoặc số lượng chính xác.
'Neither entrance is accessible' refers to two entrances and means ___.|both are inaccessible|both are accessible|exactly one is accessible|only the side entrance is accessible|Neither trong nhóm hai nghĩa không cái nào đạt điều kiện.
To mean residents were the only group consulted, choose ___.|Only residents were consulted.|Residents were only consulted.|Residents were consulted only yesterday.|Residents were consulted yesterday only.|Only đứng trước residents giới hạn nhóm người, không giới hạn hành động hoặc thời điểm.
'Either route is suitable' means the speaker accepts ___.|each of the two routes as an option|neither route|only the northern route|a route not yet identified outside the pair|Either trong câu khẳng định nói một trong hai đều có thể được chọn.
` },
{ title: "Agreement with a complex noun phrase", topic: "Finance", cefr: "C1", rule: "A verb normally agrees with the head of its subject noun phrase rather than a nearby noun inside a prepositional phrase. Each/every plus a singular noun commonly takes a singular verb. A number of plural items is plural, while the number of items is singular.", examples: "The cost of the repairs has risen. A number of invoices are missing, but the number of missing invoices is small.", rows: `
The total value of the outstanding invoices ___ higher than expected.|is|are|have|were being to|Head value số ít quyết định is, không invoices gần đó.
A number of payments ___ still awaiting verification.|are|is|has|does|A number of + plural noun nhận động từ số nhiều are.
The number of overdue payments ___ fallen this month.|has|have|are|do|Head number trong the number of là số ít, dùng has.
Each of the proposed adjustments ___ a separate explanation.|requires|require|requiring|to require|Each làm head số ít nên requires.
` },
{ title: "Reduced relatives: the passive distinction", topic: "Technology", cefr: "C1", rule: "A passive relative such as files which were stored locally can reduce to files stored locally. Use the past participle for a passive relationship. An -ing reduction normally expresses an active relationship, such as users requesting access.", examples: "The data stored on the device were encrypted. Users requesting access must identify their purpose.", rows: `
The archive ___ yesterday is the one the team verified.|uploaded|uploading|uploads|to uploading|Archive được người khác upload nên passive participle uploaded.
Users ___ an account must accept the stated terms.|creating|created|are created|have create|Users chủ động tạo account, nên active -ing creating.
Choose the faithful reduction of 'the checksum which was recorded in the log'.|the checksum recorded in the log|the checksum recording the log|the checksum which recording in the log|the checksum was recorded in the log|Past participle recorded giữ nghĩa checksum được ghi.
The files ___ in the local cache can be reopened without another download.|stored|storing|stores|are storing|Files được lưu, nên reduced passive stored.
` },
{ title: "Parallel structure in academic sentences", topic: "Education", cefr: "C1", rule: "Items coordinated by and, or or paired structures should have matching grammatical roles. After one to introducing several infinitives, later items can use base verbs. Keep noun lists as nouns and -ing lists as -ing forms unless the structure explicitly changes.", examples: "The workshop teaches students to compare, evaluate and synthesise. The rubric assesses clarity, coherence and accuracy.", rows: `
The course aims to encourage questioning, support reflection and ___ independent judgement.|develop|developing|development|developed|Aim to giới thiệu các infinitives phối hợp, nên base form develop.
Which description of the fieldwork keeps its coordinated activities grammatically parallel?|The project involves interviewing residents, mapping routes and analysing costs.|The project involves interviewing residents, routes to map and costs analysis.|The project involves interviewing residents, mapped routes and to analyse costs.|The project involves residents interview, mapping routes and costs analyse.|Ba -ing phrases đóng vai trò tương ứng sau involves.
The rubric evaluates accuracy, coherence and ___.|clarity|clear|clearly|to clear|Accuracy/coherence là nouns, nên clarity giữ song song.
Students learn not only to summarise a source but also to ___ its assumptions.|question|questioning|questioned|questions|Hai to-infinitives song song; to question là dạng phù hợp.
` },
{ title: "Ellipsis and substitute forms: avoiding repetition", topic: "Arts", cefr: "C1", rule: "Ellipsis leaves out recoverable material. Auxiliary forms can carry tense and polarity: I liked it and she did too. Neither plus auxiliary plus subject expresses a matching negative. One/ones can substitute for countable nouns, while so may substitute for a proposition after think or hope.", examples: "I enjoyed the recital and my sister did too. The blue panels are wider than the red ones.", rows: `
I didn't enjoy the final scene, and neither ___ my companion.|did|didn't|was|has|Neither đã mang phủ định; đảo auxiliary did trước companion.
The green canvases are larger than the white ___.|ones|one|it|so|Canvases số nhiều đếm được được thay bằng ones.
'Will the recital finish before nine?' 'I hope ___.'|so|one|ones|it is to|Hope so thay cho toàn mệnh đề mong điều đó xảy ra.
The pianist has rehearsed the new piece, and the vocalist ___ too.|has|does|is|was|Auxiliary has thay phần present perfect has rehearsed ... .
` },
{ title: "Counterfactual inversion without if", topic: "Travel", cefr: "C1", rule: "Formal conditional inversion can replace if: Had we known ... means If we had known ... . Were it not for ... and Should you need ... are other patterns. With had-inversion, retain the past participle and do not add if as well.", examples: "Had we booked earlier, we would have secured the cabin. Should you need assistance, contact the visitor centre.", rows: `
___ we checked the ferry schedule, we would have avoided the long wait.|Had|Have|Did|Were|Had + subject + past participle là third-conditional inversion.
Should you ___ further directions, the visitor centre can help.|need|needed|needing|needs|Should-inversion theo sau subject và base verb need.
Choose the faithful inversion of 'If I had known about the closure, I would have chosen another trail'.|Had I known about the closure, I would have chosen another trail.|If had I known about the closure, I would have chosen another trail.|Had known I about the closure, I would have chosen another trail.|Did I had known about the closure, I would have chosen another trail.|Had I known đảo had và I, bỏ if, giữ participle known.
Were it not ___ the local guide, we would be lost now.|for|to|of|by|Cấu trúc cố định Were it not for + noun phrase nêu điều kiện trái thực hiện tại.
` },
];

const bandByCefr: Record<Cefr, number> = { A2: 3.5, B1: 5, B2: 6.5, C1: 8 };
const generatedAt = "2026-10-11T00:00:00.000Z";
export const freshGrammarLessons: StoredContent[] = packs.map((pack, serial) => {
  const id = `fresh-g-${String(serial + 1).padStart(2, "0")}`;
  const slug = pack.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const questions = pack.rows.trim().split("\n").map((line, qi) => {
    const fields = line.split("|");
    if (fields.length !== 6 || fields.some(field => !field.trim())) throw new Error(`Invalid fresh grammar ${id}/${qi + 1}`);
    const [prompt, answer, d1, d2, d3, explanation] = fields as [string, string, string, string, string, string];
    const choices = [answer, d1, d2, d3];
    const offset = (serial + qi) % 4;
    const options = [...choices.slice(offset), ...choices.slice(0, offset)];
    return { id: `${id}-q${qi + 1}`, number: qi + 1, type: "choice" as const, prompt, options, answer, explanation, evidence: pack.rule, sectionIndex: 0, subskill: slug };
  });
  return { id, skill: "grammar", title: pack.title, description: "Four new contextual decisions with a focused rule, independent examples and Vietnamese explanations.", topic: pack.topic, band: bandByCefr[pack.cefr], cefr: pack.cefr, testType: "both", durationMinutes: 12, format: "lesson", sections: [{ id: `${id}-s1`, title: pack.title, text: `${pack.rule}\n\nExamples:\n${pack.examples}`, instructions: "Read the rule and examples, then choose one answer for each question. Review the contextual explanation after submitting." }], questions, vocabularyIds: [], tags: ["grammar", slug, `cefr:${pack.cefr}`, "fresh-bank-v1"], source: "ai", quality: "ai-unreviewed", createdAt: generatedAt, estimatedDifficulty: { band: bandByCefr[pack.cefr], cefr: pack.cefr, basis: "Estimated from form, discourse interpretation and counterfactual/reference demands; not psychometrically calibrated." }, objectives: ["Use grammatical form together with the stated time, reference and meaning.", `Apply the rule for ${pack.title.toLowerCase()}.`], errorTypes: [`${slug}:form`, `${slug}:meaning`, "context-insensitive-choice"], provenance: { method: "ai-assisted", version: "fresh-bank-v1", generatedAt }, review: { status: "unreviewed", checks: [], limitations: ["AI-assisted material has not received independent IELTS specialist review.", "Difficulty labels are estimates, not official IELTS calibration."] } };
});
