import type { ContentSection, IeltsQuestionType, StoredContent, StoredQuestion } from '../../shared/types.js';
import type { ReadingSource } from './expanded-reading/model.js';
import { expandedReadingLessonSources } from './expanded-reading/lesson-sources.js';
import { expandedReadingMockSources } from './expanded-reading/mock-sources.js';

const generatedAt = '2026-10-08T00:00:00.000Z';
const bands = { A2: 3.5, B1: 4.5, B2: 6, C1: 7.5 };
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const completionTypes: IeltsQuestionType[] = ['sentence-completion','summary-completion','note-completion','table-completion'];
const tidyChoices = (options:string[],serial:number) => {
  const shift = serial % options.length;
  return [...options.slice(shift),...options.slice(0,shift)];
};

function sectionQuestions(source:ReadingSource, contentId:string, sectionIndex:number, start:number, count:number, serial:number):{section:ContentSection;questions:StoredQuestion[]} {
  const sectionId = `${contentId}-section-${sectionIndex+1}`;
  const questions:StoredQuestion[]=[];
  const add = (type:StoredQuestion['type'],questionType:IeltsQuestionType,prompt:string,answer:string,evidence:string,explanation:string,options?:string[],extra:Partial<StoredQuestion>={}) => {
    const number=start+questions.length;
    questions.push({id:`${contentId}-q-${number}`,number,type,questionType,prompt,answer,evidence,explanation,sectionIndex,subskill:questionType,...(options ? {options:tidyChoices(options,number+serial)}:{}),...extra});
  };
  add('choice','multiple-choice',`Which heading best describes paragraph A of “${source.title}”?`,source.headings[0]!,source.paragraphs[0]!,
    'Đối chiếu ý chính toàn đoạn A; phương án nhắc chi tiết ở đoạn khác không khái quát đoạn được hỏi.',[...source.headings.slice(0,3),source.distractorHeadings[0]!]);
  if(source.multiple && count>=13 && serial%3===0) {
    const group={id:`${sectionId}-selection`,count:2};
    const options=[...source.multiple.answers,...source.multiple.distractors];
    for(const answer of source.multiple.answers) add('choice-multiple','multiple-choice-multiple',source.multiple.prompt,answer,source.multiple.quote,
      'Chọn đúng HAI đáp án được văn bản xác nhận; thông tin không được đề cập không trở thành đúng chỉ vì có vẻ hợp lý.',options,
      {selectionGroup:group,groupInstructions:'Choose TWO answers. Both numbered rows belong to one selection group.',options:tidyChoices(options,serial)});
  } else {
    add('text','short-answer',`${source.detail.prompt} Write NO MORE THAN ${source.detail.answer.split(/\s+/).length} WORDS.`,source.detail.answer,source.detail.quote,
      'Chép đúng cụm từ trong bài đọc; không thêm các từ chỉ ngữ cảnh ngoài phần còn thiếu.',undefined,{wordLimit:source.detail.answer.split(/\s+/).length,allowNumbers:/\d/.test(source.detail.answer)});
    add('true-false','true-false-not-given',source.trueStatement.statement,'TRUE',source.trueStatement.quote,
      'TRUE: phát biểu phù hợp với bằng chứng trích nguyên văn; kiểm tra đối tượng và điều kiện trong cùng câu.', ['TRUE','FALSE','NOT GIVEN']);
  }
  add('true-false','true-false-not-given',source.falseStatement.statement,'FALSE',source.falseStatement.quote,
    'FALSE: văn bản xác nhận thông tin trái trực tiếp với phát biểu; không đánh đồng mâu thuẫn với việc thiếu thông tin.',['TRUE','FALSE','NOT GIVEN']);
  add('true-false','true-false-not-given',source.notGiven.statement,'NOT GIVEN',source.notGiven.anchor,
    `NOT GIVEN: ${source.notGiven.reason} Dẫn chứng là mốc liên quan, không phải bằng chứng xác nhận hoặc phủ định.`,['TRUE','FALSE','NOT GIVEN']);
  add('yes-no','yes-no-not-given',source.authorYes.statement,'YES',source.authorYes.quote,
    'YES: đây là quan điểm mà tác giả trực tiếp khẳng định, không phải quan điểm chỉ được gán cho một người khác.',['YES','NO','NOT GIVEN']);
  add('yes-no','yes-no-not-given',source.authorNo.statement,'NO',source.authorNo.quote,
    'NO: nhận định này đối lập trực tiếp với quan điểm được tác giả nêu trong dẫn chứng.',['YES','NO','NOT GIVEN']);
  add('yes-no','yes-no-not-given',source.authorNotGiven.statement,'NOT GIVEN',source.authorNotGiven.anchor,
    `NOT GIVEN: ${source.authorNotGiven.reason} Không suy luận thêm quan điểm tác giả từ một đề xuất liên quan.`,['YES','NO','NOT GIVEN']);
  const headingOptions=[...source.headings,...source.distractorHeadings].map((heading,index)=>`${['i','ii','iii','iv','v','vi','vii','viii'][index]}. ${heading}`);
  for(const paragraph of [1,2]) add('matching','matching-headings',`Choose the heading for paragraph ${letters[paragraph]}.`,headingOptions[paragraph]!,source.paragraphs[paragraph]!,
    'Chọn tiêu đề bao quát nội dung chính của cả đoạn; từ trùng ở một chi tiết nhỏ không đủ để quyết định tiêu đề.',headingOptions);
  add('matching','matching-information',source.information.prompt,letters[source.information.paragraph]!,source.information.quote,
    'Xác định đoạn chứa thông tin cụ thể được hỏi. Đây là ghép thông tin, không phải ghép tiêu đề.',source.paragraphs.map((_,index)=>letters[index]!));
  add('matching','matching-features',source.features.prompt,source.features.answer,source.features.quote,
    'Đối chiếu vai trò hoặc hành động với đúng người; những người còn lại có nhiệm vụ khác được nêu rõ trong văn bản.',source.features.options);
  add('matching','matching-sentence-endings',`Complete the sentence: ${source.ending.stem} …`,source.ending.answer,source.ending.quote,
    'Vế kết thúc phải tạo câu đúng nghĩa theo đoạn văn, không chỉ đúng ngữ pháp.',[source.ending.answer,...source.ending.distractors]);
  const completionType = source.visual ? 'diagram-labelling' : source.flow ? 'flow-chart-completion' : completionTypes[serial%completionTypes.length]!;
  const completionNumber=start+questions.length;
  const blockId=`${sectionId}-completion`;
  const completion = source.visual ? {stem:source.visual.prompt,answer:source.visual.answer,quote:source.visual.quote,label:source.visual.asset.title}
    : source.flow ? {stem:source.flow.steps.find(step=>step.includes('________'))!,answer:source.flow.answer,quote:source.flow.quote,label:source.flow.title}:source.completion;
  add('text',completionType,`${completion.stem} Write NO MORE THAN ${completion.answer.split(/\s+/).length} WORDS.`,completion.answer,completion.quote,
    'Điền đúng từ/cụm từ của nguồn vào chỗ trống trong nhóm hoàn thành thông tin; chú ý dạng danh từ và giới hạn từ.',undefined,
    {wordLimit:completion.answer.split(/\s+/).length,allowNumbers:/\d/.test(completion.answer),...(source.visual?{visualId:`${sectionId}-diagram`}:{blockId})});
  const blockType = completionType==='sentence-completion'?'sentence':completionType==='summary-completion'?'summary':completionType==='note-completion'?'note':completionType==='table-completion'?'table':'flow-chart';
  const blockText=completion.stem.replace('________',`{{${completionNumber}}}`);
  const firstSentences=source.paragraphInfoAnchors?.slice(0,3).map(a=>a.quote)??[];
  const section:ContentSection={id:sectionId,title:source.title,text:source.paragraphs.map((p,index)=>`[${letters[index]}] ${p}`).join('\n\n'),
    instructions:'Original fictional reading text written for this course. Answer using this text, not outside knowledge.',
    questionBlocks:[{id:blockId,type:blockType,title:completion.label,instructions:'Complete the numbered blank using words from the passage.',questionNumbers:[completionNumber],
      ...(blockType==='table'?{rows:[{cells:['Information from the passage','Missing word(s)']},{cells:[completion.stem.replace('________','[…]'),`{{${completionNumber}}}`]}]}
        : blockType==='flow-chart'&&source.flow?{rows:source.flow.steps.map(step=>({cells:[step.replace('________',`{{${completionNumber}}}`)]}))}
        : {text:blockType==='summary'?[...firstSentences,blockText].join(' '):blockType==='note'?[...firstSentences.slice(0,2),blockText].map(sentence=>`• ${sentence}`).join('\n'):blockText})}]};
  if(source.visual) {
    delete section.questionBlocks;
    const asset=source.visual.asset;
    section.visuals=[{...asset,id:`${sectionId}-diagram`,labels:asset.labels.map(label=>label.questionNumber!==undefined?{...label,questionNumber:completionNumber}:label),
      ...(asset.nodes?{nodes:asset.nodes.map(node=>node.questionNumber!==undefined?{...node,questionNumber:completionNumber}:node)}:{})}];
  }
  // A 13-question section omits the final completion, rather than leaving a blank
  // with a question number that does not exist in the saved test.
  if(count===13){questions.pop();delete section.questionBlocks;delete section.visuals;}
  if(questions.length!==count) throw new Error(`${contentId}: ${questions.length} questions, expected ${count}`);
  return {section,questions};
}

function metadata(source:ReadingSource) {
  return {
    estimatedDifficulty:{band:bands[source.level],cefr:source.level,basis:'Ước lượng dựa trên độ dài, mật độ từ vựng và mức suy luận; chưa hiệu chuẩn bằng dữ liệu thí sinh.'},
    objectives:['Distinguish a stated fact, an explicit contradiction and missing information','Match a paragraph to its main idea','Identify authorship and roles accurately'],
    errorTypes:['over-generalisation','keyword-only-matching','false-versus-not-given','confusing-author-with-speaker'],
    provenance:{method:'ai-assisted' as const,version:'original-reading-v3',sourceDocument:'Tong_hop_cac_dang_bai_IELTS.docx',generatedAt},
    review:{status:'unreviewed' as const,checks:[],limitations:['AI-authored original fictional material; not an official IELTS paper.','Difficulty is estimated, not psychometrically calibrated.','No independent expert review has been claimed.']},
  };
}

/** Exam passages use consecutive task groups, instead of one item of every type. */
function mockSectionQuestions(source:ReadingSource,contentId:string,sectionIndex:number,start:number,count:number,serial:number):{section:ContentSection;questions:StoredQuestion[]} {
  const sectionId=`${contentId}-section-${sectionIndex+1}`;
  const section:ContentSection={id:sectionId,title:source.title,text:source.paragraphs.map((p,index)=>`[${letters[index]}] ${p}`).join('\n\n'),instructions:'Answer the grouped tasks using this original fictional text. Do not use outside knowledge.'};
  const questions:StoredQuestion[]=[];
  const add=(type:StoredQuestion['type'],questionType:IeltsQuestionType,prompt:string,answer:string,evidence:string,explanation:string,options?:string[],extra:Partial<StoredQuestion>={})=>{
    const number=start+questions.length;
    questions.push({id:`${contentId}-q-${number}`,number,type,questionType,prompt,answer,evidence,explanation,sectionIndex,subskill:questionType,...(options?{options:tidyChoices(options,serial)}:{}),...extra});
  };
  const headingTask=()=>{
    const options=[...source.headings,...source.distractorHeadings].map((h,index)=>`${['i','ii','iii','iv','v','vi','vii','viii'][index]}. ${h}`);
    source.paragraphs.forEach((p,index)=>add('matching','matching-headings',`Choose the correct heading for paragraph ${letters[index]} of “${source.title}”.`,options[index]!,p,
      'Tiêu đề phải bao quát trọng tâm toàn đoạn, không chỉ chứa một từ được nhắc đến.',options));
  };
  const truthTask=(length=4)=>{
    const statements=[
      {statement:source.trueStatement.statement,answer:'TRUE',quote:source.trueStatement.quote,reason:'Phát biểu phù hợp với thông tin được nêu rõ.'},
      {statement:source.falseStatement.statement,answer:'FALSE',quote:source.falseStatement.quote,reason:'Phát biểu mâu thuẫn trực tiếp với bằng chứng này.'},
      {statement:source.notGiven.statement,answer:'NOT GIVEN',quote:source.notGiven.anchor,reason:source.notGiven.reason},
    ];
    const trueCandidates=[source.detail.quote,source.features.quote,...(source.featureAnchors?.map(a=>a.quote)??[]),...(source.paragraphInfoAnchors?.map(a=>a.quote)??[])];
    for(const quote of trueCandidates){
      if(statements.length===length)break;
      if(statements.some(s=>s.statement===quote))continue;
      statements.push({statement:quote,answer:'TRUE',quote,reason:'Đối tượng và hành động đúng với thông tin ở đoạn được trích.'});
    }
    const shift=serial%length;
    [...statements.slice(0,length).slice(shift),...statements.slice(0,shift)].forEach(s=>add('true-false','true-false-not-given',s.statement,s.answer,s.quote,`${s.answer}: ${s.reason}`,['TRUE','FALSE','NOT GIVEN']));
  };
  const viewsTask=()=>{
    for(const [key,answer] of [['authorYes','YES'],['authorNo','NO'],['authorNotGiven','NOT GIVEN']] as const){
      const s=source[key];
      add('yes-no','yes-no-not-given',s.statement,answer,'quote'in s?s.quote:s.anchor,
        answer==='NOT GIVEN'?`NOT GIVEN: ${source.authorNotGiven.reason}`:answer==='YES'?'YES: tác giả trực tiếp nêu quan điểm này.':'NO: phát biểu đối lập trực tiếp với quan điểm được trích.', ['YES','NO','NOT GIVEN']);
    }
  };
  const featuresTask=()=>{
    const anchors=source.featureAnchors;
    if(!anchors||anchors.length<3)throw new Error(`${source.title}: requires three feature anchors`);
    anchors.slice(0,3).forEach(a=>add('matching','matching-features',`Match the person to this role: ${a.role}`,a.name,a.quote,'Ghép nhiệm vụ cụ thể với đúng người; tên người khác không đủ nếu nhiệm vụ không tương ứng.',anchors.map(a=>a.name)));
  };
  const informationTask=()=>{
    const anchors=source.paragraphInfoAnchors;
    if(!anchors||anchors.length!==4)throw new Error(`${source.title}: requires four paragraph anchors`);
    const shift=(serial+1)%4;
    [...anchors.slice(shift),...anchors.slice(0,shift)].forEach(a=>add('matching','matching-information',`Which paragraph contains this specific information? ${a.quote}`,letters[a.paragraph]!,a.quote,
      'Tìm đoạn chứa thông tin cụ thể này. Không chọn theo chủ đề chung của đoạn.',source.paragraphs.map((_,i)=>letters[i]!)));
  };
  const completionTask=()=>{
    const anchors=source.completionAnchors;
    if(!anchors||anchors.length<3)throw new Error(`${source.title}: requires three completion anchors`);
    const unique=anchors.filter((a,i,all)=>all.findIndex(x=>x.answer===a.answer)===i);
    if(unique.length<3)throw new Error(`${source.title}: needs three distinct keyed completion answers`);
    const chosen=[unique[0]!,unique[Math.floor((unique.length-1)/2)]!,unique.at(-1)!];
    const type=serial%3===0?'note-completion':serial%3===1?'table-completion':'summary-completion';
    const blockId=`${sectionId}-group-completion`;
    const blockNumbers:number[]=[];
    const blockSentences:string[]=[];
    for(const [index,a]of chosen.entries()){
      const number=start+questions.length;
      const diagram=source.visual&&index===2;
      const answer=diagram?source.visual!.answer:a.answer;
      const evidence=diagram?source.visual!.quote:a.quote;
      add('text',diagram?'diagram-labelling':type,diagram?source.visual!.prompt:`Complete the grouped information: ${a.stem}`,answer,evidence,
        'Điền từ của bài đọc vào chỗ trống đúng ngữ cảnh. Đáp án phải tuân thủ giới hạn từ.',undefined,
        {wordLimit:answer.split(/\s+/).length,allowNumbers:/\d/.test(answer),...(diagram?{visualId:`${sectionId}-diagram`}:{blockId})});
      if(diagram){
        const asset=source.visual!.asset;
        section.visuals=[{...asset,id:`${sectionId}-diagram`,labels:asset.labels.map(l=>l.questionNumber!==undefined?{...l,questionNumber:number}:l),...(asset.nodes?{nodes:asset.nodes.map(n=>n.questionNumber!==undefined?{...n,questionNumber:number}:n)}:{})}];
      }else{blockNumbers.push(number);blockSentences.push(a.stem.replace('________',`{{${number}}}`));}
    }
    section.questionBlocks=[{id:blockId,type:type==='note-completion'?'note':type==='table-completion'?'table':'summary',title:`${source.title} — key information`,instructions:`Use words from the passage. Follow the word limit shown with each question.`,questionNumbers:blockNumbers,
      ...(type==='table-completion'?{rows:[{cells:['Context','Missing words']},...blockSentences.map((s,index)=>({cells:[s.replace(`{{${blockNumbers[index]}}}`,'[…]'),`{{${blockNumbers[index]}}}`]}))]}:{text:blockSentences.join('\n')})}];
  };
  const twoChoicesTask=()=>{
    if(source.multiple){
      const group={id:`${sectionId}-choose-two`,count:2};
      const options=[...source.multiple.answers,...source.multiple.distractors];
      source.multiple.answers.forEach(answer=>add('choice-multiple','multiple-choice-multiple',source.multiple!.prompt,answer,source.multiple!.quote,
        'Chọn HAI phương án được đoạn văn xác nhận; mỗi đáp án đúng được tính một câu.',options,{selectionGroup:group,groupInstructions:'Choose TWO answers.'}));
    }else{
      add('choice','multiple-choice',`Which statement best expresses the writer's view in “${source.title}”?`,source.authorYes.statement,source.authorYes.quote,
        'Chọn quan điểm thực sự được tác giả nêu; phân biệt điều tác giả bác bỏ và điều không được bàn đến.',[source.authorYes.statement,source.authorNo.statement,source.authorNotGiven.statement,source.notGiven.statement]);
      add('choice','multiple-choice',`Why is the following arrangement mentioned: ${source.ending.stem}?`,source.ending.answer,source.ending.quote,
        'Đọc quan hệ nguyên nhân/mục đích trong dẫn chứng thay vì chọn chi tiết có từ giống nhau.',[source.ending.answer,...source.ending.distractors]);
    }
  };
  let tasks:(()=>void)[];
  if(count===14&&source.multiple)tasks=[headingTask,()=>truthTask(5),completionTask,twoChoicesTask];
  else if(count===14)tasks=[headingTask,truthTask,featuresTask,completionTask];
  else if(sectionIndex===1)tasks=[informationTask,viewsTask,featuresTask,completionTask];
  else tasks=[headingTask,truthTask,completionTask,twoChoicesTask];
  if(serial%2===1)tasks=[...tasks.slice(2),...tasks.slice(0,2)];
  tasks.forEach(task=>task());
  if(questions.length!==count)throw new Error(`${contentId} section${sectionIndex}: expected${count}, got${questions.length}`);
  return {section,questions};
}

export const expandedReadingLessons:StoredContent[]=expandedReadingLessonSources.map((source,index)=>{
  const id=`reading-v3-lesson-${String(index+1).padStart(3,'0')}`;
  const built=sectionQuestions(source,id,0,1,14,index);
  return {id,skill:'reading',title:source.title,description:`Bài đọc nguyên bản về ${source.topic.toLowerCase()}; luyện phân biệt ý chính, chi tiết và thông tin chưa được nêu.`,topic:source.topic,
    band:bands[source.level],cefr:source.level,testType:'both',durationMinutes:source.level==='A2'?18:source.level==='B1'?22:25,format:'lesson',sections:[built.section],questions:built.questions,
    vocabularyIds:[],tags:['original-reading-v3',`difficulty:${source.level}`,'fictional-source','matching-headings','matching-features'],source:'ai',quality:'ai-unreviewed',createdAt:generatedAt,...metadata(source)};
});

export const expandedReadingMocks:StoredContent[]=Array.from({length:Math.floor(expandedReadingMockSources.length/3)},(_,index)=>{
  const id=`reading-v3-mock-${String(index+1).padStart(3,'0')}`;
  const source=expandedReadingMockSources[index*3]!;
  const built=[14,13,13].map((count,sectionIndex)=>mockSectionQuestions(expandedReadingMockSources[index*3+sectionIndex]!,id,sectionIndex,sectionIndex===0?1:sectionIndex===1?15:28,count,index*3+sectionIndex));
  return {id,skill:'reading',title:`${index%2===0?'Academic':'General Training'} Reading — Original Set ${index+1}`,description:'Ba bài đọc độc lập nguyên bản, 40 câu trong 60 phút; không tái sử dụng bài luyện trong bộ đề mới.',topic:source.topic,
    band:6.5,cefr:'B2',testType:index%2===0?'academic':'general',durationMinutes:60,format:'full-mock',sections:built.map(x=>x.section),questions:built.flatMap(x=>x.questions),vocabularyIds:[],
    tags:['original-reading-v3','three-independent-passages','40-questions','60-minutes','no-reused-lesson-text'],source:'ai',quality:'ai-unreviewed',createdAt:generatedAt,...metadata(source),
    estimatedDifficulty:{band:6.5,cefr:'B2',basis:'Ước lượng cho toàn đề dựa trên độ dài ba bài, 40 câu và giới hạn60 phút; chưa hiệu chuẩn bằng dữ liệu thí sinh.'}};
});
