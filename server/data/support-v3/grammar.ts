import type { Cefr, StoredContent } from "../../../shared/types.js";

type Pack = { title: string; topic: string; cefr: Cefr; rule: string; rows: string };
// Every exercise has one contextual answer, three distractors and a Vietnamese rule.
// The rule is printed in the learning section and is the verbatim evidence for feedback.
const packs: Pack[] = [
{ title: "Quantifiers: a few, a little, fewer and less", topic: "Food", cefr: "A2", rule: "Use a few and fewer with plural countable nouns; use a little and less with uncountable nouns. A few means some, while few often means not enough. Too much and too many express excess.", rows: `
We have ___ flour left, so we can make one small cake.|a little|a few|many|fewer|Flour là danh từ không đếm được; a little diễn đạt một lượng nhỏ còn dùng được.
There are ___ apples in the bowl; take one if you like.|a few|a little|much|less|Apples đếm được ở số nhiều; a few nghĩa là có một vài quả.
This recipe uses ___ sugar than the original version.|less|fewer|many|a few|Sugar không đếm được; so sánh lượng dùng less, không dùng fewer.
The smaller class has ___ students than last year's class.|fewer|less|much|a little|Students là danh từ số nhiều đếm được; fewer chỉ số lượng thấp hơn.
There is ___ salt in this soup; it tastes unpleasantly salty.|too much|too many|a few|fewer|Salt không đếm được và ngữ cảnh chỉ lượng vượt mức; dùng too much.
Very ___ people attended, so the room was almost empty.|few|a few|little|much|Very few people nhấn mạnh số người rất ít; không dùng very a few.
` },
{ title: "Past continuous: background and interruption", topic: "Travel", cefr: "B1", rule: "The past continuous uses was or were plus -ing for an action in progress at a past time. The past simple often marks an interrupting event. Two parallel background activities can both be continuous.", rows: `
At eight last night, we ___ for our train.|were waiting|wait|have waited|are waiting|At eight last night xác định thời điểm quá khứ; hành động đang diễn ra dùng were waiting.
I ___ my suitcase when the taxi arrived.|was packing|am packing|have packed|pack|Was packing là hành động nền đang diễn ra; taxi arrived là sự kiện xen vào.
While Mina was checking the map, I ___ the tickets.|was finding|am finding|have found|find|Hai hoạt động đang diễn ra đồng thời trong quá khứ có thể đều dùng past continuous.
The guide ___ at the entrance when we reached the museum.|was standing|stands|has stood|is standing|When we reached đặt bối cảnh quá khứ; trạng thái đang đứng dùng was standing.
They ___ photographs when the rain suddenly started.|were taking|take|are taking|have taken|They là số nhiều nên dùng were taking cho hoạt động đang diễn ra trước trận mưa.
What ___ at nine yesterday evening?|were you doing|are you doing|do you do|have you done|Câu hỏi về hoạt động ở thời điểm quá khứ dùng were + chủ ngữ + V-ing.
` },
{ title: "Present perfect continuous: duration and recent activity", topic: "Education", cefr: "B2", rule: "Use have or has been plus -ing for an activity continuing from the past or recently leaving a visible result. Since names a starting point; for names a duration. Stative verbs normally use the simple perfect.", rows: `
Sam ___ pronunciation for two hours and is still practising.|has been practising|practises|was practising|had practised|For two hours và still practising cho thấy hoạt động kéo dài tới hiện tại; dùng has been practising.
We ___ on this report since Monday, and it is not finished.|have been working|work|worked|had worked|Since Monday nêu mốc bắt đầu; hoạt động chưa hoàn tất dùng have been working.
Her hands are covered in clay because she ___ pots.|has been making|makes|had made|will make|Dấu vết hiện tại của hoạt động gần đây phù hợp với has been making.
I ___ this tutor for five years. Use the usual stative form.|have known|have been knowing|was knowing|had been knowing|Know là động từ trạng thái; dạng thông thường cho thời gian tới hiện tại là have known.
How long ___ for the examination? You are still preparing.|have you been studying|had you studied|do you study|did you study|Câu hỏi thời lượng của hoạt động còn tiếp diễn dùng have you been studying.
The lecturer has been researching the topic ___ 2021.|since|for|during|by|Since đi với mốc 2021; for cần một khoảng thời gian như five years.
` },
{ title: "Past perfect: an earlier past event", topic: "Work", cefr: "B1", rule: "Use had plus a past participle to mark an event completed before another past event. This clarifies order, especially when the narrative moves backwards. Already and never can sit between had and the participle.", rows: `
By the time the meeting began, I ___ the agenda.|had printed|print|have printed|will print|Had printed cho biết việc in hoàn tất trước meeting began trong quá khứ.
She could not log in because she ___ her password.|had forgotten|forgets|has forgotten|will forget|Việc quên xảy ra trước khó khăn đăng nhập ở quá khứ; dùng had forgotten.
When we arrived, the technician ___ already ___ the equipment.|had / checked|has / checked|is / checking|does / check|Already đặt giữa had và checked; kiểm tra đã xong trước khi chúng tôi đến.
Before that interview, he ___ never ___ in an office.|had / worked|has / worked|is / working|will / work|Had never worked mô tả trải nghiệm tính đến một mốc quá khứ là that interview.
The supervisor realised that someone ___ the wrong date.|had entered|enters|has entered|will enter|Nhập sai ngày xảy ra trước realised; dùng past perfect had entered.
After the team ___ the instructions, they started the trial.|had read|has read|will read|reads|Had read đánh dấu việc đọc trước khi bắt đầu; read ở đây là past participle.
` },
{ title: "Future continuous: activity at a future time", topic: "Transport", cefr: "B2", rule: "Will be plus -ing presents an activity in progress at a future time. It can ask about someone's expected arrangements politely. It does not necessarily mean the whole action will be completed by that time.", rows: `
At ten tomorrow, our train ___ through the valley.|will be travelling|travelled|has travelled|had travelled|At ten tomorrow chỉ hoạt động đang diễn ra tại mốc tương lai; dùng will be travelling.
This time next week, I ___ my new driving course.|will be attending|attended|have attended|had attended|This time next week phù hợp với will be attending để nói hoạt động tại thời điểm ấy.
___ the car this evening? I would like to borrow it.|Will you be using|Did you use|Have you used|Had you used|Will you be using hỏi lịch sử dụng dự kiến một cách lịch sự trong tương lai.
At noon on Friday, the engineers ___ the bridge.|will be inspecting|inspected|have inspected|had inspected|Will be inspecting diễn đạt công việc kiểm tra đang diễn ra vào trưa thứ Sáu.
When you land tomorrow, we ___ in the arrivals hall.|will be waiting|waited|have waited|had waited|Hoạt động chờ dự kiến đang diễn ra khi máy bay hạ cánh dùng will be waiting.
Choose the complete future-continuous phrase: will ___ driving.|be|been|being|have|Future continuous có cấu trúc will be + V-ing; không dùng will been hoặc will being.
` },
{ title: "Future perfect: completion by a deadline", topic: "Science", cefr: "B2", rule: "Will have plus a past participle describes completion before a future reference point. By means no later than that point. In a time clause after by the time, use a present form for future reference.", rows: `
By Friday, the team ___ all the samples.|will have labelled|labels|labelled|had labelled|By Friday đặt hạn hoàn thành trong tương lai; dùng will have labelled.
By the time you arrive tomorrow, we ___ the room.|will have prepared|had prepared|prepared|are prepare|Will have prepared diễn đạt phòng được chuẩn bị xong trước lúc đến trong tương lai.
In June, she ___ the project for a full year.|will have managed|had managed|managed|is managed|Will have managed nhìn lại một năm quản lý từ mốc tháng Sáu trong tương lai.
The laboratory will have ___ the results by noon.|published|publishing|publish|publishes|Sau will have cần past participle; published là dạng đúng.
By the time the course ___ next month, I will have finished the reading.|starts|will starts|had started|has starting|Time clause by the time dùng present simple starts để chỉ tương lai.
We will have checked the instrument ___ the first trial begins.|by the time|since|for|yesterday|By the time nối hạn hoàn thành với sự kiện tương lai; since và for diễn đạt thời lượng khác.
` },
{ title: "Used to and would: past habits and states", topic: "Community", cefr: "B1", rule: "Used to plus a base verb describes a past habit or state that no longer applies. Would can recall repeated past actions once the past setting is clear, but normally does not describe past states. Be used to takes a noun or -ing form and means accustomed to.", rows: `
There ___ be a post office here, but it closed years ago.|used to|would to|is used to|use to|Used to be diễn đạt trạng thái quá khứ không còn đúng; would không thường dùng cho trạng thái này.
When we were children, we ___ visit the river every Sunday.|would|are used to|have used to|were use|Would + base verb nhớ lại hành động lặp lại, với bối cảnh quá khứ đã được nêu.
I am used to ___ in a busy neighbourhood.|living|live|lived|be live|Be used to nghĩa quen với; to là giới từ nên theo sau là living.
Did you ___ work at the old community centre?|use to|used to|using to|are used to|Sau did dùng dạng base use to; không giữ -d trong câu hỏi này.
She ___ crowded events, but now she enjoys them.|used to dislike|would to dislike|is used to dislike|use to disliked|Used to dislike mô tả trạng thái sở thích cũ đã thay đổi.
We didn't ___ have a playground in this village.|use to|used to|using to|are used to|Sau didn't dùng base form use to để nói thói quen hoặc trạng thái quá khứ.
` },
{ title: "Question tags and auxiliary agreement", topic: "Travel", cefr: "B1", rule: "A common question tag reverses the polarity of the statement and repeats its auxiliary. Use do, does or did if there is no auxiliary. The usual tag after I am is aren't I; after let's it is shall we.", rows: `
The museum closes at six, ___?|doesn't it|isn't it|didn't it|hasn't it|Closes là present simple không có trợ động từ; tag phủ định dùng doesn't it.
You have booked the hostel, ___?|haven't you|don't you|aren't you|didn't you|Have booked là present perfect; tag dùng haven’t you.
The visitors weren't late, ___?|were they|weren't they|did they|are they|Mệnh đề phủ định weren't nhận tag khẳng định were they.
Let's check the route first, ___?|shall we|will they|don't we|aren't we|Tag thông thường sau let's là shall we.
I'm in the correct queue, ___?|aren't I|amn't I|don't I|isn't I|Trong tiếng Anh chuẩn, tag thông thường sau I'm là aren't I.
Lena, our guide, explained the rules, ___?|didn't she|doesn't she|hasn't she|isn't she|Explained là past simple; với Lena, tag dùng did và đại từ she: didn't she.
` },
{ title: "Indirect questions: statement word order", topic: "Education", cefr: "B1", rule: "In an embedded question, keep subject-before-verb order: Could you tell me where the room is? Do not repeat direct-question inversion. If or whether introduces an embedded yes-no question.", rows: `
Could you tell me where ___?|the seminar is|is the seminar|does the seminar be|the seminar does is|Câu hỏi gián tiếp dùng thứ tự chủ ngữ rồi động từ: the seminar is.
Do you know when ___?|the library opens|does the library open|opens the library|is the library open regularly|When the library opens giữ trật tự câu trần thuật và không thêm does.
I wonder ___ the tutor is available tomorrow.|whether|what|which|whose|Whether đưa câu hỏi yes-no vào mệnh đề gián tiếp; không dùng what trong nghĩa liệu có.
Please explain how ___ this task.|we should approach|should we approach|do we should approach|we approach should|Câu hỏi gián tiếp giữ we trước should: how we should approach.
Can you tell me what time ___ yesterday?|the lecture ended|did the lecture end|ended the lecture|does the lecture end|Với mốc yesterday, embedded clause dùng the lecture ended, không đảo did.
I would like to know ___ there is an evening class.|if|that what|who|where is|If dùng để hỏi gián tiếp liệu có lớp tối hay không.
` },
{ title: "Reported statements: backshift and reference", topic: "Work", cefr: "B2", rule: "When reporting from a later past viewpoint, present forms often shift to past and will to would. Pronouns and time expressions follow the reporter's context. Tell normally needs a person object; say normally does not.", rows: `
On Tuesday she said, 'I am busy.' Report this on Friday: She said she ___ busy that Tuesday.|was|is being|will be|has being|Khi thuật lại ở mốc quá khứ muộn hơn, am thường lùi thành was và I đổi thành she.
He said, 'I will send it tomorrow.' The next week we reported that he ___ send it the following day.|would|will to|had will|was will|Will lùi thành would; tomorrow đổi theo mốc thuật lại thành the following day.
The manager ___ us that the office was closing.|told|said|spoke|talked|Tell cần tân ngữ người như us; say us không phải cấu trúc chuẩn.
She said she ___ the report the day before.|had finished|finishes|will finish|is finishing tomorrow|The day before trước mốc thuật lại quá khứ; had finished làm rõ trình tự.
He ___ that the figures were correct.|said|told|said us|told to|Say có thể theo trực tiếp bởi that-clause; told ở đây thiếu tân ngữ người.
Linh told me, 'My desk is upstairs.' Report later: Linh told me that ___ desk was upstairs.|her|my|your|their|My trong lời Linh phải đổi thành her khi người khác thuật lại về Linh.
` },
{ title: "Reported questions: no inversion or question mark", topic: "Technology", cefr: "B2", rule: "Reported questions use asked plus an embedded clause. Yes-no questions take if or whether; wh-questions retain the question word. Use statement word order and backshift when the past context requires it.", rows: `
She asked, 'Where is the charger?' Later: She asked where the charger ___.|was|is being|did be|had be|Câu hỏi thuật lại giữ where nhưng dùng trật tự trần thuật và lùi is thành was.
He asked, 'Do you have a backup?' Later: He asked ___ I had a backup.|whether|what|where|whose|Câu hỏi yes-no được thuật lại bằng whether hoặc if; lựa chọn đúng ở đây là whether.
The technician asked why ___.|the screen had frozen|had the screen frozen|did the screen freeze had|the screen has freezing|Câu hỏi thuật lại không đảo trợ động từ; dùng the screen had frozen.
She asked me ___ the file.|when I had uploaded|when had I uploaded|when did I uploaded|when I upload had|When vẫn giữ nhưng thứ tự là I had uploaded; không dùng đảo ngữ câu hỏi trực tiếp.
Choose the reported question with correct word order.|He asked if the network was working.|He asked if was the network working.|He asked if did the network work.|He asked if the network working was.|Embedded yes-no question dùng if + the network + was working.
The tutor asked, 'Can you open it?' Later: The tutor asked if I ___ open it.|could|can to|had can|was can|Can thường lùi thành could khi thuật lại trong bối cảnh quá khứ.
` },
{ title: "Verb patterns: infinitives and gerunds", topic: "Arts", cefr: "B1", rule: "Verb patterns are lexical: enjoy, avoid and consider commonly take -ing; decide, hope and agree commonly take to plus a base verb. After a preposition, use a noun or -ing form. Learn the whole pattern with the verb.", rows: `
I enjoy ___ portraits in natural light.|drawing|to draw|draw|drawn|Enjoy thường theo sau bởi gerund; enjoy drawing là cấu trúc đúng.
The group decided ___ a shorter play.|to perform|performing|perform|performed|Decide + to-infinitive: decided to perform.
She avoided ___ the fragile frame.|touching|to touch|touch|touched|Avoid nhận gerund; avoided touching, không avoided to touch.
We hope ___ the exhibition next month.|to visit|visiting|visit|visited|Hope + to-infinitive diễn đạt mong muốn; hope to visit.
He is interested in ___ stage lighting.|learning|to learn|learn|learned|Sau giới từ in dùng gerund learning, không dùng to learn.
The curator agreed ___ the workshop.|to lead|leading|lead|led|Agree trong nghĩa đồng ý làm việc gì nhận to-infinitive: agreed to lead.
` },
{ title: "Gerund versus infinitive: changes in meaning", topic: "Health", cefr: "B2", rule: "Remember to do means remember a duty; remember doing recalls an earlier action. Stop doing ends an activity; stop to do pauses another activity for a purpose. Try doing tests a method; try to do attempts a difficult action.", rows: `
Please remember ___ your appointment card when you leave tomorrow.|to bring|bringing|brought|bring|Remember to bring nhắc một nhiệm vụ chưa làm trong tương lai.
I remember ___ this clinic as a child; the old waiting room was blue.|visiting|to visit|visit|visited|Remember visiting hồi tưởng trải nghiệm đã xảy ra, không nhắc nhiệm vụ mới.
We stopped ___ directions, then continued walking.|to ask|asking|ask|asked|Stopped to ask nghĩa dừng việc đi bộ để hỏi đường.
He stopped ___ late at night and now goes to bed earlier.|working|to work|work|worked|Stopped working nghĩa ngừng hoạt động làm việc; stopped to work là dừng để làm việc.
If the room feels stuffy, try ___ the window and see whether it helps.|opening|to have opened|open|opened|Try opening đề xuất thử một cách rồi quan sát hiệu quả.
She tried ___ the heavy door, but she could not move it.|to open|open|opened|having open|Tried to open diễn đạt cố gắng thực hiện hành động khó nhưng không thành công.
` },
{ title: "Time prepositions: at, on and in", topic: "Community", cefr: "A2", rule: "Use at with clock times, on with days and specific dates, and in with months, years and longer periods. Usually omit these prepositions before next, last, this and every when they modify a time expression.", rows: `
The residents' meeting starts ___ seven o'clock.|at|on|in|by of|At dùng với giờ đồng hồ: at seven o'clock.
The village fair is ___ Saturday.|on|at|in|to|On dùng trước một ngày cụ thể như Saturday.
The centre opened ___ 2018.|in|on|at|for|In dùng với năm: in 2018.
The garden workshop is ___ 14 June.|on|in|at|since of|On dùng với ngày cụ thể gồm số ngày và tháng.
We will meet ___ next Monday. Choose the option that adds no preposition.|—|on|in|at|Trước next Monday trong cấu trúc này không thêm giới từ; ký hiệu — nghĩa là không thêm từ.
The fundraising event takes place ___ the evening.|in|on|at|to|Cụm thông thường là in the evening; đối chiếu với at night.
` },
{ title: "Movement prepositions: into, through and across", topic: "Travel", cefr: "A2", rule: "Into describes movement from outside to inside; out of is the reverse. Through describes movement inside a space from one side to another. Across goes from one side of a surface or area to the other; along follows a line or route.", rows: `
The visitors walked ___ the courtyard from the east side to the west side.|across|under|into from|on top|Across diễn đạt đi từ phía này sang phía kia của một khu vực.
We went ___ the tunnel and emerged at its far end.|through|onto|beside|over|Through cho biết đi bên trong đường hầm rồi ra đầu bên kia.
She stepped ___ the room from the corridor.|into|throughout|over|away|Into thể hiện chuyển động từ hành lang bên ngoài vào trong phòng.
Follow the path ___ the river; it runs beside the water.|along|above|into|throughout|Along là đi theo chiều dài con đường hoặc dòng sông.
The cat jumped ___ the table from the floor.|onto|into|through|underneath of|Onto diễn đạt chuyển động lên trên bề mặt, khác với on là vị trí.
Passengers came ___ the ferry and walked towards the terminal.|out of|into|throughout|inside|Out of thể hiện rời bên trong phương tiện ra ngoài trong câu này.
` },
{ title: "Adverbs of frequency and manner", topic: "Work", cefr: "A2", rule: "Frequency adverbs commonly precede a main verb but follow be. Manner adverbs often follow the verb's object: she checks the figures carefully. Adjectives describe nouns or follow linking verbs; adverbs modify actions.", rows: `
She ___ checks the equipment before starting.|always|careful|usual|frequent|Always là trạng từ tần suất, thường đứng trước động từ chính checks.
Our supervisor is ___ available after lunch.|usually|usual|careful|quiet|Sau be, trạng từ tần suất thường đứng trước bổ ngữ: is usually available.
The technician labelled the boxes ___.|carefully|careful|care|caringly careful|Carefully là trạng từ bổ nghĩa cho hành động labelled; careful là tính từ.
Choose the natural placement of the manner adverb.|He completed the form accurately.|He completed accurately the form.|He accurate completed the form.|He completed the accurately form.|Trạng từ chỉ cách thức thường đứng sau tân ngữ: completed the form accurately.
The new assistant speaks very ___ during meetings.|clearly|clear|clarity|clearness|Sau speaks cần trạng từ clearly; very bổ nghĩa cho trạng từ này.
The office is ___ on public holidays.|normally closed|closed normal|normal closes|normally close verb|Normally đứng sau be và closed là bổ ngữ; normally closed là trật tự tự nhiên.
` },
{ title: "Reflexive pronouns and reciprocal each other", topic: "Science", cefr: "B1", rule: "Use a reflexive pronoun when subject and object refer to the same person: she checked herself. Use each other for a reciprocal action between participants. By oneself means without company or assistance; a reflexive cannot replace an ordinary subject pronoun.", rows: `
I checked the calculation ___.|myself|me|my|mine|Myself nhấn mạnh chính tôi kiểm tra; chọn reflexive phù hợp với I.
The two researchers helped ___ during fieldwork.|each other|themselves one|himself|itself|Each other chỉ hành động hỗ trợ qua lại giữa hai nhà nghiên cứu.
She taught ___ to use the microscope.|herself|himself|itself|yourself|She và tân ngữ cùng một người nên dùng herself.
We assembled the model by ___, without any help.|ourselves|us|our|ours|By ourselves nghĩa tự làm mà không có trợ giúp.
___ prepared the labels before the experiment. Choose an ordinary subject pronoun.|They|Them|Themselves|Their|Chủ ngữ thông thường là They; reflexive Themselves không thay cho chủ ngữ độc lập ở đây.
The device switches ___ off after ten minutes.|itself|himself|herself|ourselves|Device là vật số ít; reflexive tương ứng là itself.
` },
{ title: "Possessives: apostrophes and determiners", topic: "Education", cefr: "A2", rule: "A singular possessive usually adds apostrophe-s. A regular plural ending in s usually adds an apostrophe only. Possessive determiners precede nouns; possessive pronouns replace noun phrases. Its has no apostrophe when it means belonging to it.", rows: `
The books belong to one student: the ___ books.|student's|students'|students|student|Một student sở hữu dùng student's; students' là của nhiều sinh viên.
The room belongs to several tutors: the ___ room.|tutors'|tutor's|tutors|tutor|Danh từ số nhiều tutors đã có s, nên thêm dấu nháy sau s: tutors'.
This notebook belongs to me. It is ___.|mine|my|me|myself|Mine thay thế cả cụm my notebook; my cần một danh từ theo sau.
The college updated ___ website.|its|it's|it|itself|Its chỉ sở hữu; it's là viết tắt của it is hoặc it has.
Those are ___ notes, not yours. The notes belong to us.|our|ours|us|ourselves|Our là tính từ sở hữu đứng trước notes; ours không đặt trước danh từ.
The equipment belongs to the children: the ___ equipment.|children's|childrens'|childrens|children|Children là số nhiều bất quy tắc không kết thúc bằng s nên sở hữu dùng children's.
` },
{ title: "Either, neither and both: reference and agreement", topic: "Transport", cefr: "B2", rule: "Either refers to one of two alternatives; neither excludes both; both includes the pair. In careful formal style, either or neither of a plural set can take a singular verb. Both takes a plural verb. Not either corresponds to neither.", rows: `
___ routes reach the station, so you can choose one.|Both|Neither|Every|Much|Both routes bao gồm hai tuyến và phù hợp với động từ số nhiều reach.
Neither of the two lifts ___ working. Use formal singular agreement.|is|are|were|have|Trong văn phong trang trọng yêu cầu ở đây, neither of the two lifts dùng is.
You may take ___ of these two buses; they serve the same stop.|either|neither|every|much|Either of two nghĩa một trong hai đều được; neither nghĩa không chiếc nào.
Both platforms ___ accessible from the main entrance.|are|is|was|has|Both platforms là chủ ngữ số nhiều nên dùng are.
The first route is closed, and the second is closed too. ___ route is available.|Neither|Either|Both|Each of|Neither route phủ định cả hai tuyến trong cặp lựa chọn.
I cannot use ___ ticket because both have expired.|either|both of|every of|much|Not either tương đương neither; either ticket phù hợp với hai vé và động từ phủ định.
` },
{ title: "Zero conditionals and habitual when", topic: "Environment", cefr: "B1", rule: "A zero conditional uses present forms for a general relationship: if soil becomes dry, plants lose water. It describes repeated or general situations, not an unreal past. When can replace if when the repeated event is treated as expected.", rows: `
If water ___ below its freezing point under suitable conditions, ice can form.|cools|cooled|will cooled|had cool|Quan hệ khái quát dùng present simple cools trong if-clause.
When the soil becomes very dry, the sensor ___ an alert.|sends|sent yesterday|had sent|will sent|Đây là phản ứng lặp lại của thiết bị; present simple sends diễn đạt quy luật hoạt động.
If visitors leave food outside, birds often ___ it.|find|found last week|had found|would found|Zero conditional dùng present simple cho kết quả thường xảy ra: birds find it.
Choose the sentence describing a general operating rule.|If the tank is full, the pump stops.|If the tank had been full, the pump would have stopped.|If the tank were full now, the pump would stop.|If the tank was full yesterday, it stopped then.|Câu If the tank is full, the pump stops dùng present ở cả hai vế để nêu quy tắc chung.
If people ___ the marked path, they reduce damage to plants.|follow|followed yesterday|had followed|will followed|Follow ở present simple phù hợp với điều kiện tổng quát; không cần will trong if-clause này.
The lights switch off ___ the room is empty, as a regular programmed rule.|when|although|despite|in spite|When nối điều kiện lặp lại được dự kiến; although diễn đạt tương phản, không phải quy tắc kích hoạt.
` },
{ title: "Purpose clauses: to, so that and in order to", topic: "Technology", cefr: "B1", rule: "Use to or in order to plus a base verb for purpose. So that introduces a full clause, often with can or could. Do not confuse purpose with a completed result: a design aim does not prove success.", rows: `
We encrypted the file ___ protect private information.|to|for protect|because protect|so protecting|To + base verb nêu mục đích: to protect.
The button is larger so that users ___ find it more easily.|can|to|for|because|So that nhận mệnh đề có chủ ngữ users và động từ can find.
She saved a backup in order ___ recover the document later.|to|for|that|of|In order to là cụm mục đích cố định trước base verb recover.
The team added captions ___ viewers could follow the audio.|so that|for to|because of|despite|So that nối một mệnh đề đầy đủ viewers could follow để nêu mục đích.
The device uses less power ___ extend battery life.|to|for extending to|so extend|because extending|To extend nêu mục đích thiết kế; không dùng so + base verb khi thiếu that-clause.
Choose the sentence expressing an aim rather than a proven outcome.|We changed the layout to improve readability.|The layout improved readability in the test.|The test confirmed higher reading speed.|All users read the new layout faster.|To improve nói mục tiêu thay đổi; không tự khẳng định kết quả đã được chứng minh.
` },
{ title: "Cause and result: because, due to and therefore", topic: "Health", cefr: "B2", rule: "Because introduces a clause; because of and due to take noun phrases. Therefore links a reason to its consequence but requires sentence punctuation. So can coordinate clauses. A causal connector should reflect evidence, not create an unsupported causal claim.", rows: `
The appointment was postponed ___ the clinician was unavailable.|because|because of|due to|despite of|Because theo sau là mệnh đề the clinician was unavailable.
The session was cancelled because of ___.|staff absence|staff were absent|staff are absent|staff had absent|Because of nhận noun phrase staff absence, không nhận mệnh đề độc lập.
The clinic was closed; ___, patients received new appointment dates.|therefore|although|despite|whereas|Therefore nối hệ quả sau dấu chấm phẩy và được ngăn bằng dấu phẩy.
The survey was delayed due to ___.|a technical fault|the system failed|the system was failing|it failed yesterday|Due to cần noun phrase a technical fault trong cấu trúc này.
The waiting room was full, ___ we opened another room.|so|because of|despite|due to|So liên kết hai mệnh đề theo quan hệ nguyên nhân–kết quả.
Choose the connector that introduces a reason with a full clause: The team repeated the test ___ the reading looked unusual.|because|owing to|due to|because of|The reading looked unusual là mệnh đề đầy đủ nên dùng because.
` },
{ title: "Wish and if only: present dissatisfaction and past regret", topic: "Travel", cefr: "B2", rule: "Wish plus a past form expresses a desired present difference. Wish plus had and a past participle expresses regret about the past. Wish plus would can request a change in another person's behaviour; it is not a neutral substitute for hope.", rows: `
I wish the hostel ___ closer to the station now.|were|will be|had being|is to|Wish + past form were thể hiện mong thực tế hiện tại khác đi.
We missed the ferry. I wish we ___ earlier.|had left|leave|will leave|have leaving|Sự nuối tiếc về quá khứ dùng wish + had left.
The room is noisy. I wish the neighbours ___ turn their music down.|would|had|will to|are|Wish + would có thể mong người khác thay đổi hành vi đang gây khó chịu.
If only I ___ the map before setting off yesterday.|had checked|check|will check|am checking|If only + past perfect had checked diễn đạt tiếc về việc chưa làm trong quá khứ.
I wish I ___ speak the local language fluently now.|could|can to|had can|will could|Could sau wish nói khả năng hiện tại mong có nhưng chưa có.
Choose the ordinary expression for a realistic future expectation.|I hope the train arrives on time tomorrow.|I wish the train arrives on time tomorrow.|I wish the train will to arrive.|I wish the train had arrive tomorrow.|Hope dùng cho hy vọng thực tế tương lai; wish không trực tiếp nhận arrives theo nghĩa này.
` },
{ title: "Causative have and get: arranged services", topic: "Work", cefr: "B2", rule: "Have or get plus an object and a past participle describes arranging for someone else to do a service: have the printer repaired. Have someone do and get someone to do focus on the person performing the action. The subject is not necessarily the repairer.", rows: `
We had the printer ___ by a technician.|repaired|repair|repairing|repairs|Have + object + past participle: had the printer repaired; người khác sửa.
She got the office windows ___ last week.|cleaned|clean|cleaning|cleans|Get + object + past participle diễn đạt dịch vụ được sắp xếp: got windows cleaned.
The manager had the assistant ___ the agenda.|print|to print|printed|printing|Have + person + base verb: had the assistant print.
I got my colleague ___ the spreadsheet.|to check|check|checked|checking|Get + person + to-infinitive: got my colleague to check.
Which sentence clearly means a service was arranged, not necessarily performed by the speaker?|I had my laptop repaired.|I repaired my laptop.|I am repairing my laptop.|I repair laptops every week.|Had my laptop repaired là causative, chỉ việc thu xếp để người khác sửa.
Tomorrow we will have the locks ___.|replaced|replace|replacing|to replacing|Trong have + object + participle, locks là thứ nhận hành động nên dùng replaced.
` },
{ title: "Cleft sentences: focusing on information", topic: "Arts", cefr: "C1", rule: "An it-cleft uses It is or was plus the focused element and a that or who clause. A what-cleft treats the what-clause as a unit: What the audience valued was the clear storytelling. Keep focus and agreement clear rather than adding emphasis mechanically.", rows: `
It was the lighting ___ created the strongest impression.|that|what|which it|whose it|It-cleft có cấu trúc It was + focused noun phrase + that-clause.
What the audience valued most ___ the clear storytelling.|was|were them|have|are to|What-clause được xem như một đơn vị ở đây nên dùng was.
Choose the cleft that focuses on the director.|It was the director who changed the ending.|The director who it was changed the ending.|What changed the ending the director it was.|It was who the director changed ending.|It was the director who... đặt người đạo diễn vào vị trí focus.
It was in the final scene ___ the motif returned.|that|where it|what|whose|It-cleft nhấn mạnh trạng ngữ in the final scene, nối tiếp bằng that.
What the dancers needed ___ more rehearsal time.|was|were them|have been they|are to|What the dancers needed làm một what-clause chủ ngữ, dùng was trong cấu trúc này.
Choose the sentence focusing on time rather than the performer.|It was after the interval that the soloist appeared.|It was the soloist who appeared after the interval.|The soloist appeared after the interval.|What appeared was the soloist.|After the interval là thành phần được đưa vào focus của it-cleft đầu tiên.
` },
{ title: "Nominalisation without losing agency", topic: "Science", cefr: "C1", rule: "Nominalisation turns an action into a noun phrase: researchers measured the water becomes the researchers' measurement of the water. It can make prose concise but may hide who acted. Preserve agency where needed and avoid unnecessary strings of abstract nouns.", rows: `
The verb assess becomes the noun ___.|assessment|assessive|assessly|assessingness|Danh từ thông dụng của assess là assessment.
Choose the nominalisation that retains the actor: The technicians calibrated the sensor.|the technicians' calibration of the sensor|the sensor's calibrating the technicians|the calibration did by sensor|technicians calibratedness|The technicians' calibration of the sensor giữ rõ ai thực hiện và cái gì được hiệu chuẩn.
Which revision is clearer about responsibility?|The team rejected the proposal.|Rejection occurred.|A rejection was experienced.|There was rejection.|The team rejected the proposal nêu tác nhân team; các cách còn lại che mờ tác nhân.
Complete the noun phrase: the ___ of the sample size.|reduction|reduce|reductively|reducingly|Sau the và trước of cần danh từ reduction.
Which noun correctly derives from analyse?|analysis|analyseness|analysely|analyticality|Analysis là danh từ tương ứng với động từ analyse; analytical là tính từ.
Choose the clear action sentence instead of an unnecessary noun string.|Researchers compared the results.|Result comparison performance execution occurred.|Comparison result conduct was made.|A making of comparison performance happened.|Researchers compared the results nêu hành động và tác nhân trực tiếp, tránh chuỗi danh từ rườm rà.
` },
{ title: "Past modal deduction: must, might and can't have", topic: "Community", cefr: "B2", rule: "Must have plus a past participle expresses a strong inference about the past, not an obligation. Might have expresses a possibility. Can't have or could not have expresses a strong inference that something did not happen. Use evidence to choose the strength of the claim.", rows: `
The hall lights were on and her bag was inside. She ___ arrived before us, I am almost certain.|must have|must to|must had|has must|Must have arrived là suy luận mạnh về việc đã xảy ra, dựa trên dấu hiệu trong quá khứ.
I am not sure why he missed the meeting. He ___ forgotten the time.|might have|must had|might to|has might|Might have forgotten chỉ một khả năng, phù hợp với I am not sure.
The room was locked all day and she had no key. She ___ entered it through that locked door.|can't have|must have|should to have|may to|Can't have entered diễn đạt suy luận phủ định mạnh từ bằng chứng không có chìa khóa.
The notice must have ___ down during the storm.|fallen|fall|falling|falls|Sau modal + have cần past participle; fallen là dạng của fall.
Choose a past possibility rather than a strong deduction.|The organiser might have sent the email.|The organiser must have sent the email.|The organiser cannot have sent the email.|The organiser had to send the email.|Might have sent nêu khả năng; must have mạnh hơn, cannot have phủ định, had to là nghĩa nghĩa vụ.
We cannot find the sign-in sheet; someone ___ moved it, but there are other explanations.|may have|must to|may to have|must had|May have moved là suy đoán có giới hạn, giữ khả năng giải thích khác.
` },
{ title: "Parallel structures in lists and comparisons", topic: "Environment", cefr: "C1", rule: "Coordinate comparable grammatical forms: reducing waste, saving water and protecting habitats. With infinitives, a shared to can introduce a coordinated set of base verbs. Parallel form helps clarity but should not force different ideas into an inaccurate comparison.", rows: `
The programme encourages recycling, repairing and ___.|reusing|to reuse|reuse to|reused|Ba thành phần danh sách cùng là gerund: recycling, repairing, reusing.
The project aims to restore wetlands, protect birds and ___ runoff.|reduce|reducing|reduced|to reducing|Một to có thể dùng chung cho các base verb restore, protect, reduce.
Choose the parallel list.|We measured depth, width and temperature.|We measured depth, widening and how hot.|We measured deep, width and warm.|We measured depth, to widen and temperature.|Depth, width và temperature đều là danh từ làm tân ngữ của measured.
The method is both affordable and ___.|effective|effectively|effectiveness|to effect|Both nối hai tính từ cùng loại: affordable và effective.
The campaign focuses not only on collecting waste but also on ___ it.|sorting|to sort|sort|sorted|Sau hai giới từ on, collecting và sorting đều ở dạng gerund.
Choose the revision with matching verb forms.|Residents can walk, cycle or take a bus.|Residents can walking, cycle or took a bus.|Residents can walk, cycling or taken a bus.|Residents can walks, cycled or taking a bus.|Sau can, cả ba lựa chọn hành động dùng base verbs: walk, cycle, take.
` },
{ title: "Coordination and punctuation between clauses", topic: "Finance", cefr: "B2", rule: "Two independent clauses can be joined by a coordinating conjunction, a semicolon or a full stop. A comma alone is usually a comma splice in formal writing. However is a linking adverb, not a coordinating conjunction, so punctuation must separate the clauses.", rows: `
Choose the correctly punctuated contrast.|Revenue rose; however, costs rose too.|Revenue rose, however costs rose too.|Revenue rose however costs rose too.|Revenue rose, costs rose too.|However nối hai mệnh đề độc lập sau dấu chấm phẩy và theo sau bởi dấu phẩy.
Choose the complete coordination.|The fee is low, but the waiting time is long.|The fee is low, the waiting time is long.|The fee is low but however long time.|The fee is low, despite the waiting time is long.|But là coordinating conjunction nối hai mệnh đề độc lập; comma alone không đủ.
Which sentence avoids a comma splice?|The invoice arrived. We paid it the next day.|The invoice arrived, we paid it the next day.|The invoice arrived we paid it the next day.|The invoice arrived, therefore we paid it the next day.|Dấu chấm tách hai mệnh đề hoàn chỉnh, tránh comma splice.
The prices fell ___ demand remained weak. Choose the coordinating conjunction.|and|however|nevertheless|therefore|And là coordinating conjunction; however, nevertheless và therefore là linking adverbs.
Choose the appropriate punctuation before a consequence introduced by therefore.|The budget was reduced; therefore, the launch was postponed.|The budget was reduced, therefore the launch was postponed.|The budget was reduced therefore the launch was postponed.|The budget was reduced, the launch therefore postponed.|Therefore cần phân cách mệnh đề bằng dấu chấm phẩy hoặc chấm trong văn phong này.
Which revision correctly joins two independent clauses with so?|The receipt was missing, so we requested a copy.|The receipt was missing so requested we a copy.|The receipt was missing, therefore requested a copy.|The receipt missing, so copy we requested.|So nối hai mệnh đề có chủ ngữ và động từ rõ ràng: receipt was và we requested.
` },
{ title: "Comparative correlatives: the more, the less", topic: "Education", cefr: "C1", rule: "The comparative-correlative construction connects two changing quantities: the more regularly you practise, the more confident you become. Both halves begin with the plus a comparative expression. It describes an association and does not itself prove a causal relationship.", rows: `
The more regularly you review, ___ likely you are to forget.|the less|less the|least|the least than|Cấu trúc tương quan dùng the + comparative ở cả hai vế: the more..., the less...
The ___ the explanation, the easier it is to follow.|clearer|clearest|clearly|clarity|Sau the trong cấu trúc này cần comparative adjective clearer.
Choose the complete correlative sentence.|The longer we waited, the more anxious we became.|Longer we waited, more anxious became.|The longest we waited, the anxious we became.|The longer waited we, the most anxious we became.|Hai vế đều có the + comparative và trật tự chủ ngữ–động từ thông thường.
The less time students spend commuting, ___ time they have for study.|the more|the most|more the|the many|The more time là comparative quantity đối xứng với the less time.
The more carefully we check references, ___ errors remain.|the fewer|the less|the fewest|the little|Errors đếm được số nhiều nên dùng the fewer.
Does the grammar of 'The more X, the more Y' alone prove causation? Choose the accurate statement.|No; evidence is still needed to establish causation.|Yes; the construction guarantees causation.|Yes; comparisons exclude all alternative explanations.|No; the construction cannot describe any association.|Cấu trúc tương quan mô tả thay đổi liên hệ; ngữ pháp không tự cung cấp bằng chứng nhân quả.
` },
{ title: "Determiners and reference: another, other and the other", topic: "Travel", cefr: "B1", rule: "Another normally means one more or a different singular countable item. Other precedes a plural or uncountable noun. The other identifies the remaining member of a known pair; the others replaces the remaining plural noun phrase.", rows: `
This hostel is full. We need to find ___ hostel.|another|other|others|the others|Another đứng trước danh từ đếm được số ít để chỉ một chỗ khác.
Some visitors went to the museum; ___ visitors stayed at the hotel.|other|another|others|the another|Other đứng trước visitors số nhiều; others tự thay danh từ nên không đứng trước visitors.
There are two paths. This one is steep; ___ one is level.|the other|another of|others|other a|The other xác định thành viên còn lại trong cặp hai lối đi đã biết.
I packed three shirts. One is blue; ___ are white.|the others|the other|another|other|The others thay cho hai chiếc còn lại của nhóm đã được xác định.
Could we stay for ___ night?|another|others|other|the others|Another night nghĩa thêm một đêm; night là danh từ đếm được số ít.
We need ___ information before booking.|other|another|others|an other|Information không đếm được; other information là cấu trúc đúng.
` },
{ title: "Ellipsis and substitution: avoiding unnecessary repetition", topic: "Work", cefr: "C1", rule: "Ellipsis omits material recoverable from context. Auxiliary substitution preserves the original tense: she checks the log and he does too. So do I signals agreement with a positive clause; neither do I with a negative one. One or ones can substitute for countable noun phrases.", rows: `
Maya checks the log daily, and Leon ___ too.|does|is|has|did|Checks là present simple; auxiliary substitution dùng does với Leon số ít.
I haven't finished the draft. ___ has Amir.|Neither|So|Also so|Either too|Mệnh đề phủ định haven't nhận cấu trúc Neither has Amir.
I enjoy working outdoors. So ___ I.|do|am|have|did|Enjoy là present simple không có auxiliary nên agreement dùng So do I.
We tested the old scanner, but the new ___ was faster.|one|ones|it ones|them|One thay cho scanner đếm được số ít trong new one.
They submitted the form yesterday, and we ___ too.|did|do|have|are|Submitted là past simple; did thay thế hành động quá khứ đã nêu.
The first reports are incomplete; use the revised ___ instead.|ones|one|it|that|Reports là số nhiều nên dùng ones để thay thế cả noun phrase.
` },
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const band: Record<Cefr, number> = { A2: 4, B1: 5, B2: 6.5, C1: 7.5 };
const independentExamples = [
  "There is a little oil in the bottle. We have fewer chairs than last week.",
  "At dawn, the chef was preparing breakfast. While I was reading, my brother was painting.",
  "I have been repairing this model since breakfast. She has known her neighbour for years.",
  "The rain had stopped before the concert began. He had never used that tool before the workshop.",
  "At sunset tomorrow, we will be sailing past the island. Will you be staying for the final discussion?",
  "By next winter, the committee will have reviewed every proposal. By the time spring arrives, the repairs will be complete.",
  "My aunt used to own a small bookshop. After school, we would gather beside the fountain.",
  "The gardeners have finished, haven't they? You aren't using this chair, are you?",
  "Could you explain how the valve works? I would like to know whether the map is current.",
  "The director told us that she was leaving. He said he would call the following morning.",
  "The mechanic asked whether I had heard the noise. She asked where the package had been delivered.",
  "They considered renting a hall. I offered to organise the refreshments.",
  "I stopped to photograph the sunset. She remembers meeting the novelist last year.",
  "The festival starts at noon on Friday. Our visitors will arrive in October.",
  "The children ran across the playground. We carried the parcels into the warehouse.",
  "Our neighbours rarely use the lift. The musician played the passage softly.",
  "The twins introduced themselves. The two teams congratulated each other.",
  "The mechanic's van is outside. These gloves are hers; those are mine.",
  "Either entrance is suitable. Both entrances have automatic doors.",
  "If the door is open, the warning light stays on. When ice warms sufficiently, it melts.",
  "The group met early to prepare the room. We left extra space so that wheelchairs could turn.",
  "The ferry stopped because visibility was poor. The game ended early due to heavy rain.",
  "I wish I had listened to the announcement. If only the path were less steep.",
  "We had the curtains washed. The coordinator got a volunteer to check the list.",
  "It was the costumes that caught my attention. What I admired most was the intricate rhythm.",
  "The observers' classification of the samples was recorded. The observers classified each sample before testing.",
  "They might have misunderstood the address. With every door sealed, the visitor can't have entered unnoticed.",
  "The scheme promotes walking, cycling and sharing vehicles. Its aims are clear and achievable.",
  "Sales increased, but costs also rose. The order was urgent; therefore, we chose express delivery.",
  "The wider the opening, the more light enters. The less noise there is, the easier concentration becomes.",
  "One lift is working; the other is being serviced. Some folders are complete, but others need labels.",
  "Asha has read the report, and Tomas has too. I don't need a receipt; neither does my colleague.",
];

export const expandedGrammarLessons: StoredContent[] = packs.map((pack, serial) => {
  const id = `grammar-v3-lesson-${String(serial + 1).padStart(2, "0")}`;
  const questions = pack.rows.trim().split("\n").map((line, qi) => {
    const [prompt, answer, d1, d2, d3, explanation] = line.split("|");
    if (![prompt, answer, d1, d2, d3, explanation].every(Boolean)) throw new Error(`Invalid grammar row ${id}/${qi}`);
    const values = [answer!, d1!, d2!, d3!];
    const offset = (serial + qi) % 4;
    const options = [...values.slice(offset), ...values.slice(0, offset)];
    return { id: `${id}-q${qi + 1}`, number: qi + 1, type: "choice" as const, prompt: prompt!, options, answer: answer!, explanation: explanation!, evidence: pack.rule, sectionIndex: 0, subskill: slug(pack.title) };
  });
  return { id, skill: "grammar", title: pack.title, description: "Six contextual grammar decisions with bilingual explanations and distinct distractors.", topic: pack.topic, cefr: pack.cefr, band: band[pack.cefr], testType: "both", durationMinutes: 15, format: "lesson", sections: [{ id: `${id}-section`, title: pack.title, text: `${pack.rule}\n\nIndependent examples:\n${independentExamples[serial]}`, instructions: "Read the explanation. Choose one answer for each contextual question; review the Vietnamese rule after submitting." }], questions, vocabularyIds: [], tags: ["grammar", slug(pack.title), `cefr:${pack.cefr}`, "ai-generated-v3"], source: "ai", quality: "ai-unreviewed", createdAt: "2026-10-08T00:00:00.000Z", estimatedDifficulty: { band: band[pack.cefr], cefr: pack.cefr, basis: "Estimated from grammatical form, reference and discourse demands; not psychometrically calibrated." }, objectives: [`Recognise the forms and meanings in ${pack.title.toLowerCase()}.`, "Choose an appropriate grammatical pattern using time, reference and discourse context."], errorTypes: [`${slug(pack.title)}:form`, `${slug(pack.title)}:meaning`, "context-insensitive-pattern-selection"], provenance: { method: "ai-assisted", version: "content-v3", generatedAt: "2026-10-08T00:00:00.000Z" }, review: { status: "unreviewed", checks: [], limitations: ["AI-generated material has not received independent specialist review.", "CEFR and band assignments are estimated, not psychometrically calibrated."] } };
});
