import type { ContentSection, IeltsQuestionType, StoredContent, StoredQuestion } from '../../../shared/types.js';
import type { AdvancedSource } from './reading/model.js';
import { band8LessonSources } from './reading/lesson-sources.js';
import { band8MockSources } from './reading/mock-sources.js';

const generatedAt = '2026-10-08T00:00:00.000Z';
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const romans = ['i','ii','iii','iv','v','vi','vii','viii'];
const completionKinds: IeltsQuestionType[] = ['summary-completion','note-completion','table-completion','sentence-completion'];

function buildSection(source: AdvancedSource, contentId: string, sectionIndex: number, start: number, count: 13 | 14, serial: number, mock: boolean) {
  const sectionId = `${contentId}-section-${sectionIndex + 1}`;
  const section: ContentSection = {
    id: sectionId, title: source.title,
    text: source.paragraphs.map((text, index) => `[${letters[index]}] ${text}`).join('\n\n'),
    instructions: 'Read the original passage and answer using only its information. The organisations, people and studies described are fictional teaching examples.',
  };
  const questions: StoredQuestion[] = [];
  const add = (type: StoredQuestion['type'], questionType: IeltsQuestionType, prompt: string, answer: string, evidence: string, explanation: string, options?: string[], extra: Partial<StoredQuestion> = {}) => {
    const number = start + questions.length;
    questions.push({ id: `${contentId}-q-${number}`, number, sectionIndex, type, questionType, prompt, answer, evidence, explanation,
      subskill: questionType, ...(options ? { options } : {}), ...extra });
  };
  const rawHeadings = [...source.headings, ...source.distractorHeadings];
  const shift = (serial * 3 + 2) % rawHeadings.length;
  const mixedHeadings = [...rawHeadings.slice(shift), ...rawHeadings.slice(0,shift)];
  const headingOptions = mixedHeadings.map((heading, index) => `${romans[index]}. ${heading}`);
  const headings = (indices: number[]) => indices.forEach(index => add('matching','matching-headings',`Choose the correct heading for paragraph ${letters[index]}.`,headingOptions[mixedHeadings.indexOf(source.headings[index]!)]!,source.paragraphs[index]!,
    'Chọn ý chính của cả đoạn. Phương án nhiễu dùng chi tiết có thật ở đoạn khác hoặc diễn giải quá mức phạm vi kết luận.',headingOptions));
  const facts = () => {
    const rows = [
      { ...source.facts.true, answer: 'TRUE', explanation: 'Phát biểu diễn đạt lại đúng điều kiện và phạm vi của thông tin trong bài.' },
      { ...source.facts.false, answer: 'FALSE', explanation: 'Phát biểu mâu thuẫn với thông tin được nói rõ; đối chiếu điều kiện, thời điểm hoặc phép so sánh.' },
      { statement: source.facts.notGiven.statement, quote: source.facts.notGiven.anchor, answer: 'NOT GIVEN', explanation: source.facts.notGiven.reason },
    ];
    const offset = serial % 3;
    [...rows.slice(offset), ...rows.slice(0,offset)].forEach(row => add('true-false','true-false-not-given',row.statement,row.answer,row.quote,`${row.answer}: ${row.explanation}`,['TRUE','FALSE','NOT GIVEN']));
  };
  const views = () => {
    const rows = [
      { ...source.views.yes, answer: 'YES', explanation: 'Nhận định phù hợp với quan điểm của tác giả, bao gồm giới hạn của lập luận.' },
      { ...source.views.no, answer: 'NO', explanation: 'Nhận định đối lập trực tiếp với quan điểm tác giả; không đồng nhất thiếu dữ kiện với phản đối.' },
      { statement: source.views.notGiven.statement, quote: source.views.notGiven.anchor, answer: 'NOT GIVEN', explanation: source.views.notGiven.reason },
    ];
    const offset = (serial + 1) % 3;
    [...rows.slice(offset),...rows.slice(0,offset)].forEach(row => add('yes-no','yes-no-not-given',row.statement,row.answer,row.quote,`${row.answer}: ${row.explanation}`,['YES','NO','NOT GIVEN']));
  };
  const information = () => add('matching','matching-information',source.information.prompt,letters[source.information.paragraph]!,source.information.quote,
    'Tìm đoạn có chi tiết được yêu cầu, không chỉ đoạn có cùng chủ đề. Chú ý vai trò của ví dụ trong lập luận.',source.paragraphs.map((_,index) => letters[index]!));
  const feature = () => add('matching','matching-features',source.feature.prompt,source.feature.answer,source.feature.quote,
    'Ghép mô tả hành động hoặc lập trường với đúng người; các tên khác có vai trò riêng được nêu trong bài.',source.feature.options);
  const ending = () => add('matching','matching-sentence-endings',`Complete the sentence: ${source.ending.stem} …`,source.ending.answer,source.ending.quote,
    'Câu hoàn chỉnh cần giữ đúng quan hệ nguyên nhân hoặc điều kiện trong văn bản; các vế nhiễu có thể đúng ngữ pháp nhưng sai ý.',[source.ending.answer,...source.ending.distractors]);
  const detail = () => add('text','short-answer',`${source.detail.prompt} Write NO MORE THAN ${source.detail.answer.split(/\s+/u).length} WORDS.`,source.detail.answer,source.detail.quote,
    'Lấy cụm từ nguyên văn trả lời đúng câu hỏi; không thêm từ và không dựa vào kiến thức bên ngoài.',undefined,{wordLimit:source.detail.answer.split(/\s+/u).length});
  const multiple = () => {
    const raw = [source.multiple.answers[0],source.multiple.distractors[0],source.multiple.distractors[1],source.multiple.answers[1],source.multiple.distractors[2]];
    const offset = (serial * 2 + 1) % raw.length;
    const options = [...raw.slice(offset),...raw.slice(0,offset)];
    const group = { id: `${sectionId}-multi`, count: 2 };
    source.multiple.answers.forEach(answer => add('choice-multiple','multiple-choice-multiple',source.multiple.prompt,answer,source.multiple.quote,
      'Chọn HAI thông tin được văn bản xác nhận. Hai ô thuộc cùng một nhóm; không chọn một kết quả chỉ được đặt giả thuyết.',options,{selectionGroup:group,groupInstructions:'Choose TWO answers. Questions in this group share the same five options.'}));
  };
  const completion = () => {
    const number = start + questions.length;
    const answer = source.visual?.answer ?? source.completion.answer;
    const evidence = source.visual?.quote ?? source.completion.quote;
    const limit = answer.split(/\s+/u).length;
    if (source.visual) {
      const visualId = `${sectionId}-asset`;
      section.visuals = [{ id: visualId, type: source.visual.type, title: 'Stages in the procedure described', width: 660, height: 200,
        description: 'Follow the sequence in the passage. Complete the numbered blank with words from the text.', labels: [],
        nodes: [
          {id:'stage-a',x:20,y:65,width:180,height:70,text:source.visual.fixedStart},
          {id:'stage-b',x:240,y:65,width:180,height:70,questionNumber:number},
          {id:'stage-c',x:460,y:65,width:180,height:70,text:source.visual.fixedEnd},
        ],connections:[{from:'stage-a',to:'stage-b'},{from:'stage-b',to:'stage-c'}] }];
      add('text','diagram-labelling',`${source.visual.prompt} Write NO MORE THAN ${limit} WORDS.`,answer,evidence,
        'Dựa vào thứ tự và chức năng các công đoạn trong bài để điền ô của sơ đồ; tiêu đề và nhãn cố định không cho sẵn đáp án.',undefined,{wordLimit:limit,visualId});
      return;
    }
    const kind = source.flow ? 'flow-chart-completion' : completionKinds[serial % completionKinds.length]!;
    const blockId = `${sectionId}-block`;
    const text = source.completion.stem.replace('________',`{{${number}}}`);
    const type = kind === 'flow-chart-completion' ? 'flow-chart' : kind === 'table-completion' ? 'table' : kind === 'note-completion' ? 'note' : kind === 'sentence-completion' ? 'sentence' : 'summary';
    section.questionBlocks = [{ id:blockId,type,title:source.flow?.title ?? 'Information from the passage',instructions:`Complete the blank. Write NO MORE THAN ${limit} WORDS from the passage.`,questionNumbers:[number],
      ...(type === 'table' ? {rows:[{cells:['Procedure or observation','Detail']},{cells:['Recorded finding',text]}]}
        : source.flow ? {rows:source.flow.steps.map(step=>({cells:[step.replace('________',`{{${number}}}`)]}))}
        : {text}) }];
    add('text',kind,`${source.completion.stem} Write NO MORE THAN ${limit} WORDS.`,answer,evidence,
      'Điền cụm từ nguyên văn vào chỗ trống; giữ đúng chức năng ngữ pháp và giới hạn từ của yêu cầu.',undefined,{wordLimit:limit,blockId});
  };
  const completionGroup = (length: 3 | 4) => {
    const anchors = source.completionAnchors?.slice(0,length);
    if (!anchors || anchors.length !== length) throw new Error(`${contentId}/${sectionIndex}: a mock completion group needs ${length} independent anchors`);
    const kind = completionKinds[(serial+1) % completionKinds.length]!;
    const type = kind === 'table-completion' ? 'table' : kind === 'note-completion' ? 'note' : kind === 'sentence-completion' ? 'sentence' : 'summary';
    const blockId = `${sectionId}-exam-block`;
    const numbers = anchors.map((_,index)=>start+questions.length+index);
    const lines = anchors.map((anchor,index)=>anchor.stem.replace('________',`{{${numbers[index]}}}`));
    section.questionBlocks = [{id:blockId,type,title:`Findings and methods: ${source.title}`,instructions:'Complete the numbered blanks. Write NO MORE THAN THREE WORDS from the passage for each answer.',questionNumbers:numbers,
      ...(type === 'table' ? {rows:lines.map((line,index)=>({cells:[`Detail ${index+1}`,line]}))}
        : {text:lines.join(type==='note'?'\n':' ')})}];
    anchors.forEach(anchor=>add('text',kind,`${anchor.stem} Write NO MORE THAN THREE WORDS.`,anchor.answer,anchor.quote,
      'Điền cụm từ nguyên văn của đoạn vào đúng ô; phân biệt vai trò được hỏi với các phương pháp hoặc kết quả lân cận. Không thêm suy luận ngoài văn bản.',undefined,{wordLimit:3,blockId,groupInstructions:'Write NO MORE THAN THREE WORDS from the passage for each answer.'}));
  };
  if (mock) {
    headings([0,1,2,3,4]);
    if (count === 13) facts(); else views();
    multiple();
    completionGroup(count === 13 ? 3 : 4);
  } else if (serial % 3 === 0) {
    headings([0,1,2,3,4]); facts(); views(); information(); feature(); completion();
  } else if (serial % 3 === 1) {
    add('choice','multiple-choice',`Which statement best describes the purpose of paragraph A?`,source.headings[0]!,source.paragraphs[0]!,
      'Đáp án phải bao quát vấn đề được mở ra trong đoạn đầu; phân biệt mục tiêu tác giả với một chi tiết được trình bày ở đoạn sau.',[source.headings[2]!,source.distractorHeadings[0],source.headings[0]!,source.headings[4]!]);
    multiple(); facts(); views(); information(); feature(); ending(); detail(); completion();
  } else { headings([0,2,4]); facts(); views(); information(); feature(); ending(); detail(); completion(); }
  if (questions.length !== count) throw new Error(`${contentId}/${sectionIndex}: expected ${count} questions, got ${questions.length}`);
  return { section, questions };
}

function metadata(band: number) {
  return {
    source: 'ai' as const, quality:'ai-unreviewed' as const, createdAt:generatedAt,
    estimatedDifficulty:{band,cefr:'C1' as const,basis:'Ước lượng từ văn bản dài, mật độ lập luận, giới hạn kết luận và các đáp án nhiễu diễn giải; chưa hiệu chuẩn bằng dữ liệu thí sinh.'},
    objectives:['Trace an argument while distinguishing qualifications from general claims','Identify the evidence for a stated fact or an author’s view','Separate contradiction, inference and information not supplied'],
    errorTypes:['unwarranted-causation','scope-shift','writer-versus-cited-opinion','false-versus-not-given','distractor-paraphrase'],
    provenance:{method:'ai-assisted' as const,version:'original-reading-v4-band8',sourceDocument:'Duo Shared Learning Path v1.1',generatedAt},
    review:{status:'unreviewed' as const,checks:[],limitations:['Original fictional AI-authored teaching passages; not official IELTS papers.','Automated source/key checks do not replace independent expert review.','Estimated difficulty is not a calibrated band prediction.']},
  };
}

export const band8ReadingLessons: StoredContent[] = band8LessonSources.map((source,index) => {
  const id = `reading-v4-band8-${String(index+1).padStart(2,'0')}`;
  const band = index < 8 ? 7.5 : 8;
  const {section,questions} = buildSection(source,id,0,1,14,index,false);
  return {id,skill:'reading',title:source.title,description:'Đọc nâng cao: lập luận có điều kiện, diễn đạt lại và phân biệt dữ kiện với suy luận.',topic:source.topic,band,cefr:'C1',testType:source.testType,durationMinutes:22,format:'lesson',sections:[section],questions,vocabularyIds:[],tags:['band-8','advanced-reading',...new Set(questions.map(question=>question.questionType!))],...metadata(band)};
});

export const band8ReadingMocks: StoredContent[] = band8MockSources.map((sources,index) => {
  const id = `reading-v4-band8-mock-${String(index+1).padStart(2,'0')}`;
  const band = index < 2 ? 7.5 : 8;
  const built = sources.map((source,sectionIndex) => buildSection(source,id,sectionIndex,sectionIndex===0?1:sectionIndex===1?14:27,sectionIndex===2?14:13,index*3+sectionIndex,true));
  return {id,skill:'reading',title:`Advanced Reading mock ${index+1}: ${sources.map(source=>source.topic).join(' / ')}`,description:'Ba bài đọc nguyên bản, 40 câu hỏi theo nhóm dạng bài, 60 phút. Độ khó ước lượng hướng tới band 7.5–8.0.',topic:sources.map(source=>source.topic).join(' / '),band,cefr:'C1',testType:'academic',durationMinutes:60,format:'full-mock',sections:built.map(item=>item.section),questions:built.flatMap(item=>item.questions),vocabularyIds:[],tags:['band-8','advanced-reading','full-mock'],...metadata(band)};
});
