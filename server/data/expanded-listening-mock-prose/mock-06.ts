import type { ListeningMockDraft } from "./types.js";

/** Independently authored practice; speech order follows the grouped question booklet. */
export const mock06Draft: ListeningMockDraft = {
  "serial": 6,
  "title": "Listening Mock 06 — Alterations, radio and recognising patterns",
  "testType": "general",
  "topics": [
    "Work",
    "Arts",
    "Education",
    "Technology"
  ],
  "parts": [
    {
      "part": 1,
      "title": "Arranging alterations to a second-hand coat",
      "topic": "Work",
      "script": [
        [
          "Tailor",
          "Good afternoon, North Street Alterations. We repair and adjust clothes, although we do not make new suits from scratch. If you can describe the item, I can tell you whether an appointment is likely to be useful. I cannot promise an exact price without examining the fabric and seams, because two coats that look similar may be constructed very differently inside."
        ],
        [
          "Customer",
          "I bought a second-hand coat that fits across the shoulders but is too long in the sleeves. It is good quality and I would rather alter it than buy something new. One pocket lining is also torn. The shop suggested that I shorten it myself, but there are buttons near the cuffs and I do not want to make a mistake that cannot be repaired."
        ],
        [
          "Tailor",
          "The buttons make it worth checking carefully. Shortening from the cuff may change their position, whereas shortening from the shoulder involves more work. What is your name, and when do you need the coat? Our ordinary waiting time is a week after the fitting, but complicated work can take longer. We prefer to explain that before somebody relies on an optimistic collection date."
        ],
        [
          "Customer",
          "My surname is Pereira, P-E-R-E-I-R-A. I need it for a family celebration on 12 November. I could come for a fitting this Saturday, if you have a space. The coat is wool, according to the label. I have not had it cleaned yet because I wondered whether the alterations should be done first. It does not look dirty, but I do not know how long it was stored."
        ],
        [
          "Tailor",
          "Please have it cleaned before the fitting. Saturday is full, but I have a slot on Monday at 17:20. That should leave enough time before your celebration. Wear the sort of top you expect to have underneath, rather than a thick jumper that would change the fit."
        ],
        [
          "Customer",
          "Monday works. I normally wear a light shirt with it, so I will bring one. Can you give me an approximate cost for the sleeves and the pocket? I know the final figure depends on examining it. I mainly need to know whether this is a sensible repair compared with the price I paid for the coat. It was inexpensive, but I would still like it to last."
        ],
        [
          "Tailor",
          "A straightforward sleeve adjustment starts at 34 pounds. Replacing a pocket lining is usually another 12 pounds. If we have to work from the shoulder, I will quote separately before doing anything. You can decide not to proceed after the fitting. The appointment itself is free, so there is no reason to approve a repair merely because you have already paid to hear the estimate. Cleaning can change how an older garment sits, and we should measure the coat in the condition in which you will wear it."
        ],
        [
          "Customer",
          "That is reassuring. One button is missing as well, but I found a spare inside the coat. I can bring it along. My main concern is that shortening the sleeves will leave marks where the old stitching was. The fabric is dark, so perhaps it will not show much, but I would rather know if a neat result is unlikely before you spend time working on it."
        ],
        [
          "Tailor",
          "We can examine the old stitch line under good light and discuss the likely result. Some marks relax after pressing, while others remain visible. I will not promise that an old garment will look as if it has never been altered. A careful repair can still be worthwhile even when a close inspection reveals its history. Bring the spare button in a labelled envelope."
        ],
        [
          "Customer",
          "How do I collect it? I work near the station and can usually come in the early evening. Also, should I pay a deposit at the fitting, or do you take payment once I have tried the coat on again? I would like to check the sleeve length with my hands relaxed, because in the shop I kept holding my arms forward without noticing."
        ],
        [
          "Tailor",
          "Payment is due on collection. We send a text message when the work is ready, but do not come before receiving it just because the estimated week has passed. At collection you can try the coat on and check the agreed adjustments. Our Thursday closing time is 19:00, which may suit your work schedule. Other weekdays we close at six."
        ],
        [
          "Customer",
          "Then Thursday should be convenient. I will arrange cleaning, bring the shirt and spare button, and see you on Monday. Thank you for explaining the choices rather than just telling me the coat is too old. I like the idea of keeping something useful in service, but I also understand that not every repair can remove every sign of wear."
        ]
      ],
      "questionBlocks": [
        {
          "id": "coat-notes",
          "type": "note",
          "title": "Coat alteration appointment",
          "instructions": "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          "questionNumbers": [
            1,
            2,
            3,
            4,
            5,
            6
          ],
          "text": "Surname: {{1}}\nGarment material: {{2}}\nFitting day: {{3}}\nFitting time: {{4}}\nBasic sleeve adjustment: £{{5}}\nPocket lining: £{{6}}."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Surname",
          "answer": "Pereira",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "pereira"
          ],
          "evidence": "My surname is Pereira, P-E-R-E-I-R-A.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Material",
          "answer": "wool",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "wool"
          ],
          "evidence": "The coat is wool, according to the label.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Fitting day",
          "answer": "Monday",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "monday"
          ],
          "evidence": "Saturday is full, but I have a slot on Monday at 17:20.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Fitting time",
          "answer": "17:20",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "17:20",
            "17.20",
            "5:20pm",
            "5.20pm",
            "5:20 pm",
            "5:20",
            "5.20"
          ],
          "evidence": "Saturday is full, but I have a slot on Monday at 17:20.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Sleeve price",
          "answer": "34",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "34"
          ],
          "evidence": "A straightforward sleeve adjustment starts at 34 pounds.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Pocket price",
          "answer": "12",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "12"
          ],
          "evidence": "Replacing a pocket lining is usually another 12 pounds.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coat-notes"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why should the coat be cleaned before fitting?",
          "answer": "Cleaning may affect how it fits.",
          "options": [
            "Cleaning may affect how it fits.",
            "The tailor refuses all second-hand clothes.",
            "The cleaning service includes the missing button."
          ],
          "evidence": "Cleaning can change how an older garment sits, and we should measure the coat in the condition in which you will wear it.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the tailor say about old stitch marks?",
          "answer": "They may remain visible despite a careful repair.",
          "options": [
            "They may remain visible despite a careful repair.",
            "They always disappear when the sleeve is shortened.",
            "They can only be assessed after payment."
          ],
          "evidence": "Some marks relax after pressing, while others remain visible.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "What should hold the spare button?",
          "answer": "labelled envelope",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "labelled envelope"
          ],
          "evidence": "Bring the spare button in a labelled envelope.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "How will the customer know the coat is ready?",
          "answer": "text message",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "text message"
          ],
          "evidence": "We send a text message when the work is ready, but do not come before receiving it just because the estimated week has passed.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        }
      ]
    },
    {
      "part": 2,
      "title": "A community radio open-day tour",
      "topic": "Arts",
      "script": [
        [
          "Producer",
          "Welcome to Shoreline Community Radio. Today you can see how a small station makes programmes with volunteers. We are not a commercial music station, and local people contribute stories, interviews and specialist interests as well as songs. That variety is one of our strengths, but it means programme planning needs coordination. Two volunteers cannot both promise to use the same studio at the same time simply because their ideas are interesting. The floor plan will help you find the open-day activities. Our entrance is at the southwest corner, and the reception desk is immediately inside. A corridor runs east along the lower part of the building, then turns north near the far wall. From reception, take the first doorway on the north side of the corridor. It leads to Studio B. This studio is used for recorded interviews, so the door may be opened between sessions. Studio A, labelled on your plan, is broadcasting live and is not part of the visitor route. Continue east along the corridor. The room beside the corner, before the corridor turns north, is the editing suite. Volunteers work there after a recording has been made, removing technical problems without changing what a speaker intended to say. Follow the corridor north, and the next room on your left is the archive. It contains recordings and programme notes, including older material that has not yet been transferred to digital storage. At the northern end of the corridor you reach the meeting room. Talks will be held there, and chairs can be rearranged between groups. Please keep the corridor itself clear. A conversation that seems harmless can block the route for a visitor using a wheelchair or for someone carrying equipment. There are three demonstrations this afternoon. The interview demonstration shows how to ask a useful follow-up question instead of simply moving down a prepared list. The sound-effects demonstration shows how ordinary objects can suggest a scene without a large recording location. The editing demonstration shows how small changes can improve clarity, but also how careless editing can alter meaning. Visitors should recognise that last point as an ethical issue, not merely a technical skill. Our youth programme offers a fourth activity: writing a short radio introduction. Participants draft a few sentences that give the listener a reason to stay without promising information the programme does not contain. The first station tour begins at 12:50 from reception. Please collect a coloured visitor badge before joining it. The badge does not allow you to enter every room; it helps staff recognise who belongs to the tour. If you arrive after the group has left, wait for the next departure rather than opening studio doors to search for them. A recording may be in progress even when the corridor seems quiet. We ask visitors to silence phones near the studios. The concern is not only a ringtone appearing in an interview. A speaker can become distracted when somebody repeatedly checks a screen, and the quality of the conversation may suffer. Photographs are allowed in the public rooms with permission from the people visible. Some guests speak about personal experiences and do not want their visit shared online. Consent to be recorded for a programme is not automatically consent to appear in every visitor's photograph. People often ask how to become presenters. The first step is to attend a volunteer introduction, where we explain responsibilities and let you try basic tasks. You do not need a dramatic voice or expensive equipment. Listening carefully, preparing accurately and keeping promises about when you will arrive are more useful at the beginning. Volunteers can start by researching or organising recordings if speaking live does not appeal to them. Finally, we welcome corrections. A local station can make mistakes, and a listener who spots one helps us improve. We distinguish a disagreement about opinion from a factual error, but both deserve a respectful response. Building trust takes more than broadcasting something that sounds confident."
        ]
      ],
      "visuals": [
        {
          "id": "radio-plan",
          "type": "plan",
          "title": "Shoreline Community Radio visitor floor",
          "width": 700,
          "height": 500,
          "areas": [
            {
              "id": "upper-west",
              "x": 130,
              "y": 180,
              "width": 190,
              "height": 160,
              "fill": "#e8ecef"
            },
            {
              "id": "lower-east",
              "x": 370,
              "y": 230,
              "width": 190,
              "height": 110,
              "fill": "#e8ecef"
            },
            {
              "id": "upper-east",
              "x": 370,
              "y": 80,
              "width": 190,
              "height": 120,
              "fill": "#e8ecef"
            },
            {
              "id": "top-space",
              "x": 490,
              "y": 10,
              "width": 160,
              "height": 55,
              "fill": "#e8ecef"
            }
          ],
          "paths": [
            {
              "id": "visitor-corridor",
              "style": "path",
              "points": [
                [
                  70,
                  400
                ],
                [
                  600,
                  400
                ],
                [
                  600,
                  45
                ]
              ]
            }
          ],
          "labels": [
            {
              "id": "reception",
              "x": 60,
              "y": 445,
              "text": "Reception"
            },
            {
              "id": "live-room",
              "x": 180,
              "y": 90,
              "text": "Studio A — live"
            },
            {
              "id": "blank-one",
              "x": 225,
              "y": 275,
              "questionNumber": 1
            },
            {
              "id": "blank-two",
              "x": 465,
              "y": 290,
              "questionNumber": 2
            },
            {
              "id": "blank-three",
              "x": 465,
              "y": 135,
              "questionNumber": 3
            },
            {
              "id": "blank-four",
              "x": 570,
              "y": 45,
              "questionNumber": 4
            }
          ]
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "plan-labelling",
          "prompt": "Name the room reached through the first doorway north of the corridor.",
          "answer": "Studio B",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "studio b"
          ],
          "evidence": "It leads to Studio B.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "radio-plan"
        },
        {
          "type": "text",
          "questionType": "plan-labelling",
          "prompt": "Name the room immediately before the corridor corner.",
          "answer": "editing suite",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "editing suite"
          ],
          "evidence": "The room beside the corner, before the corridor turns north, is the editing suite.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "radio-plan"
        },
        {
          "type": "text",
          "questionType": "plan-labelling",
          "prompt": "Name the room on the left after the corridor turns north.",
          "answer": "archive",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "archive"
          ],
          "evidence": "Follow the corridor north, and the next room on your left is the archive.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "radio-plan"
        },
        {
          "type": "text",
          "questionType": "plan-labelling",
          "prompt": "Name the room at the corridor's northern end.",
          "answer": "meeting room",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "meeting room"
          ],
          "evidence": "At the northern end of the corridor you reach the meeting room.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "radio-plan"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Interview demonstration",
          "answer": "asking follow-up questions",
          "options": [
            "asking follow-up questions",
            "creating scenes with objects",
            "preserving meaning while improving clarity",
            "drafting an introduction"
          ],
          "evidence": "The interview demonstration shows how to ask a useful follow-up question instead of simply moving down a prepared list.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Sound-effects demonstration",
          "answer": "creating scenes with objects",
          "options": [
            "asking follow-up questions",
            "creating scenes with objects",
            "preserving meaning while improving clarity",
            "drafting an introduction"
          ],
          "evidence": "The sound-effects demonstration shows how ordinary objects can suggest a scene without a large recording location.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Editing demonstration",
          "answer": "preserving meaning while improving clarity",
          "options": [
            "asking follow-up questions",
            "creating scenes with objects",
            "preserving meaning while improving clarity",
            "drafting an introduction"
          ],
          "evidence": "The editing demonstration shows how small changes can improve clarity, but also how careless editing can alter meaning.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Youth activity",
          "answer": "drafting an introduction",
          "options": [
            "asking follow-up questions",
            "creating scenes with objects",
            "preserving meaning while improving clarity",
            "drafting an introduction"
          ],
          "evidence": "Our youth programme offers a fourth activity: writing a short radio introduction.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What should late arrivals do?",
          "answer": "Wait for another tour.",
          "options": [
            "Wait for another tour.",
            "Use their badge to enter the live studio.",
            "Interrupt the recording to find the guide."
          ],
          "evidence": "If you arrive after the group has left, wait for the next departure rather than opening studio doors to search for them.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the producer value in a new volunteer?",
          "answer": "Reliable preparation and careful listening.",
          "options": [
            "Reliable preparation and careful listening.",
            "Owning professional recording equipment.",
            "Having an unusually dramatic speaking voice."
          ],
          "evidence": "Listening carefully, preparing accurately and keeping promises about when you will arrive are more useful at the beginning.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    },
    {
      "part": 3,
      "title": "Planning a bread-staling experiment",
      "topic": "Education",
      "script": [
        [
          "Ravi",
          "Our food-science assignment asks us to compare storage methods for bread. I started by listing several kinds of bread from the supermarket, but that may be too broad. Different recipes already have different moisture and fat levels. If one loaf stays soft longer, we could not attribute that result just to the container. We need a simpler question before we buy anything."
        ],
        [
          "Clara",
          "Let us use one batch of bread and compare paper bags with sealed plastic boxes. I was going to include refrigeration as well, but that changes temperature and packaging at the same time. We can keep temperature constant in this experiment. A later investigation could test cooling separately. The point is to isolate a comparison we can explain, not to put every possible variable into a small student project."
        ],
        [
          "Supervisor",
          "That is a useful start. Remember that staling and visible mould are different processes. Bread can become less pleasant to eat without showing mould, and mould growth is not a simple measure of firmness. Your task should not require tasting food stored for several days. Decide on measurements that can be made safely and consistently, and keep the samples clearly labelled."
        ],
        [
          "Supervisor",
          "Good reasoning. Where will the samples be kept? A windowsill can create differences in warmth and direct sunlight even within one room. If one box is beside a radiator and another is under a shelf, packaging will not be the only difference. Use a controlled storage area and record conditions rather than assuming the room remains unchanged all week."
        ],
        [
          "Ravi",
          "We can use the laboratory cupboard away from the heating pipe. The samples will be checked at the same time each day. Opening a box repeatedly may affect moisture, though, so we should prepare separate samples for each measurement day. That requires more slices, but it avoids making the later samples different simply because they have been handled more often."
        ],
        [
          "Clara",
          "Ravi will check the equipment setup with the technician. We should not always put the paper-bag samples on the top shelf, because the shelf position might matter. Random placement will distribute that possible effect. During measurement, we can cover the packaging labels so the person taking the readings does not expect one method to be softer."
        ],
        [
          "Ravi",
          "We will measure mass loss and firmness. Those are the two main outcomes. Mass loss can suggest moisture leaving the sample, although it is not a complete explanation of every change. For firmness, we can use the texture probe in the teaching laboratory. I thought pressing slices by hand might be enough, but the pressure would vary between people and between trials."
        ],
        [
          "Clara",
          "Each slice will have the same thickness. The technician can show us the guide used for cutting, and we will reject uneven end pieces. We also need the same starting mass as closely as practical. I wondered about trimming slices to exact equality, but cutting away different amounts might change the exposed surface. We should record starting mass and compare proportional changes rather than reshape every sample."
        ],
        [
          "Supervisor",
          "You are thinking about bias as well as control. How many repeats can you manage? More is useful, but collecting a large number of careless readings does not improve the study. Plan enough time to clean the probe and check that samples are positioned in the same way. A precise instrument can still produce inconsistent data if the procedure changes between readings."
        ],
        [
          "Ravi",
          "We can manage four samples per method on each measurement day. Our pilot will be on Tuesday. If the probe crushes the slice completely, we need to adjust its setting before the main experiment. We will photograph the sample position during the pilot so we can reproduce it later. The photograph will document the method rather than substitute for the numerical reading."
        ],
        [
          "Clara",
          "I will prepare the labels and the random placement list. In the report, we will graph the proportional mass change and the probe result separately. Combining them into one score would hide whether they move together. We should explain any disagreement instead of choosing whichever measure makes the result look simpler. If a sample develops visible mould, it will be removed according to the laboratory procedure and the missing reading will be noted."
        ],
        [
          "Supervisor",
          "That is appropriate. Your conclusion should concern this bread, these containers and the observed conditions. You may discuss how another recipe could behave differently, but do not turn a short experiment into a universal household recommendation. A clear method and an honest account of limitations will be more valuable than a confident answer that goes beyond the data."
        ]
      ],
      "questionBlocks": [
        {
          "id": "bread-summary",
          "type": "summary",
          "title": "Bread storage investigation",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            7,
            8,
            9,
            10
          ],
          "text": "A texture {{7}} measures firmness. Slices must share the same {{8}}. The pilot is on {{9}}. Clara prepares the random placement {{10}}."
        }
      ],
      "questions": [
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why will the students use one bread batch?",
          "answer": "Recipe differences could confound the comparison.",
          "options": [
            "Recipe differences could confound the comparison.",
            "It removes the need for repeated measurements.",
            "All supermarket bread has identical ingredients."
          ],
          "evidence": "Different recipes already have different moisture and fat levels.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why was refrigeration excluded?",
          "answer": "It would change temperature as well as packaging.",
          "options": [
            "It would change temperature as well as packaging.",
            "The laboratory has no storage cupboard.",
            "Cold bread cannot be weighed."
          ],
          "evidence": "I was going to include refrigeration as well, but that changes temperature and packaging at the same time.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why prepare separate samples for each measurement day?",
          "answer": "Repeated opening could affect the samples.",
          "options": [
            "Repeated opening could affect the samples.",
            "The probe can only be cleaned once.",
            "Shelf position is irrelevant after the pilot."
          ],
          "evidence": "Opening a box repeatedly may affect moisture, though, so we should prepare separate samples for each measurement day.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why cover packaging labels during measurement?",
          "answer": "To reduce expectations about the result.",
          "options": [
            "To reduce expectations about the result.",
            "To make the containers airtight.",
            "To prevent the technician finding the samples."
          ],
          "evidence": "During measurement, we can cover the packaging labels so the person taking the readings does not expect one method to be softer.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO main outcomes will be measured?",
          "answer": "mass loss",
          "options": [
            "mass loss",
            "taste preferences",
            "number of supermarket recipes",
            "firmness"
          ],
          "evidence": "We will measure mass loss and firmness.",
          "selectionGroup": {
            "id": "bread-outcomes",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO main outcomes will be measured?",
          "answer": "firmness",
          "options": [
            "mass loss",
            "taste preferences",
            "number of supermarket recipes",
            "firmness"
          ],
          "evidence": "We will measure mass loss and firmness.",
          "selectionGroup": {
            "id": "bread-outcomes",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Texture instrument",
          "answer": "probe",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "probe"
          ],
          "evidence": "For firmness, we can use the texture probe in the teaching laboratory.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bread-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Slice dimension",
          "answer": "thickness",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "thickness"
          ],
          "evidence": "Each slice will have the same thickness.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bread-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Pilot day",
          "answer": "Tuesday",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "tuesday"
          ],
          "evidence": "Our pilot will be on Tuesday.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bread-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Clara's material",
          "answer": "list",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "list"
          ],
          "evidence": "I will prepare the labels and the random placement list.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bread-summary"
        }
      ]
    },
    {
      "part": 4,
      "title": "Reading handwriting with computers",
      "topic": "Technology",
      "script": [
        [
          "Lecturer",
          "Recognising handwriting is an interesting example of a task that people perform fluently without necessarily being able to explain every step. A reader uses the shape of marks, the arrangement of words and knowledge of language. A computer system must obtain useful information from an image and decide how much confidence to place in its interpretation. Today we will examine a simplified recognition pipeline, while remembering that modern systems may combine stages rather than treating them as completely separate operations. In our diagram, the scanned image enters a stage called segmentation. This separates useful units, such as lines or possible words, from the surrounding page. Segmentation is difficult when letters join together or when a writer places lines unusually close. A mistake at this stage can affect everything that follows. If two words are treated as one, a later system may search for an interpretation that no reader would consider. This is one reason some recognition approaches avoid requiring an exact letter boundary before making a prediction. The next box in the diagram is features. These are informative patterns extracted from the image, such as strokes, edges or relationships between parts of a shape. Earlier systems often relied on features selected by designers. Many newer systems learn representations from examples. That does not mean the system has human understanding of the writer's intention. It means that training has adjusted its internal operations so certain patterns become useful for predicting a label. The quality and variety of examples influence what it can recognise reliably. The candidate reading is then checked against a lexicon, which is the last box in this simplified pipeline. A lexicon provides possible words, but it must not become a reason to reject every unfamiliar name. Before recognition begins, the image itself presents a challenge. A page may be photographed at an angle, poorly lit or partly shadowed. Lines from the reverse side can show through thin paper. Preprocessing attempts to reduce these difficulties by adjusting contrast and correcting the page orientation. The aim is not simply to produce a visually neat picture; it is to preserve information that helps distinguish one possible reading from another. Evaluation requires a separate set of examples that were not used to train the system. Testing examples must be separate from training examples. If the same writer's pages appear throughout both training and testing, the result may exaggerate performance on unfamiliar handwriting. Researchers therefore report how the data were divided and what kinds of writing the test contains. A score from clear modern forms does not establish equal performance on damaged archival pages. Character errors and word errors also reveal different aspects of performance; a single wrong character can change an entire name. When the cost of an error is high, uncertain material should be reviewed by a person. Important uncertain text requires human review. The interface can show the original image beside the proposed text so the reviewer can compare them directly. Hiding the source makes it harder to notice a confident substitution that fits the sentence but not the marks on the page. Three cautions deserve attention before we finish. However, cleaning an image too aggressively can remove faint marks that belong to the writing. Historical documents may contain place names, spellings or specialised terms absent from a modern word list. A system that replaces an unusual word with a common one can create a plausible but incorrect transcription. Context is helpful, yet the image should remain part of the evidence rather than disappearing behind an expectation about what people usually write. Confidence scores need careful interpretation. A high score expresses the model's assessment under its training and design, not a guarantee that the reading is correct. Human review is not perfect either, particularly when a document contains unfamiliar vocabulary. A useful workflow records corrections and allows another reader to inspect disputed passages. The goal is to make uncertainty visible and manageable. Automated recognition can greatly reduce repetitive work, but it should not be described as recovering meaning without error. Its most reliable use combines appropriate examples, transparent evaluation and a process for checking important readings against the original evidence."
        ]
      ],
      "visuals": [
        {
          "id": "recognition-diagram",
          "type": "diagram",
          "title": "Simplified handwriting-recognition pipeline",
          "width": 700,
          "height": 300,
          "labels": [],
          "nodes": [
            {
              "id": "input",
              "x": 15,
              "y": 95,
              "width": 110,
              "height": 80,
              "text": "Scanned image"
            },
            {
              "id": "stage-one",
              "x": 155,
              "y": 95,
              "width": 130,
              "height": 80,
              "questionNumber": 1
            },
            {
              "id": "stage-two",
              "x": 315,
              "y": 95,
              "width": 130,
              "height": 80,
              "questionNumber": 2
            },
            {
              "id": "stage-three",
              "x": 475,
              "y": 95,
              "width": 100,
              "height": 80,
              "questionNumber": 3
            },
            {
              "id": "output",
              "x": 605,
              "y": 95,
              "width": 80,
              "height": 80,
              "text": "Review"
            }
          ],
          "connections": [
            {
              "from": "input",
              "to": "stage-one"
            },
            {
              "from": "stage-one",
              "to": "stage-two"
            },
            {
              "from": "stage-two",
              "to": "stage-three"
            },
            {
              "from": "stage-three",
              "to": "output"
            }
          ]
        }
      ],
      "questionBlocks": [
        {
          "id": "recognition-notes",
          "type": "note",
          "title": "Recognition and evaluation",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            4,
            5,
            6,
            7
          ],
          "text": "Image preparation includes adjusting {{4}}.\nTesting examples must be separate from {{5}} examples.\nImportant uncertain text requires human {{6}}.\nThe interface should show the original {{7}}."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the initial stage in the illustrated workflow.",
          "answer": "segmentation",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "segmentation"
          ],
          "evidence": "In our diagram, the scanned image enters a stage called segmentation.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "recognition-diagram"
        },
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the middle stage in the illustrated workflow.",
          "answer": "features",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "features"
          ],
          "evidence": "The next box in the diagram is features.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "recognition-diagram"
        },
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the final stage in the illustrated workflow.",
          "answer": "lexicon",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "lexicon"
          ],
          "evidence": "The candidate reading is then checked against a lexicon, which is the last box in this simplified pipeline.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "recognition-diagram"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Image adjustment",
          "answer": "contrast",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "contrast"
          ],
          "evidence": "Preprocessing attempts to reduce these difficulties by adjusting contrast and correcting the page orientation.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "recognition-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Examples excluded from testing",
          "answer": "training",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "training"
          ],
          "evidence": "Testing examples must be separate from training examples.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "recognition-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Human action",
          "answer": "review",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "review"
          ],
          "evidence": "Important uncertain text requires human review.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "recognition-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Source displayed",
          "answer": "image",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "image"
          ],
          "evidence": "The interface can show the original image beside the proposed text so the reviewer can compare them directly.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "recognition-notes"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What risk does excessive image cleaning create?",
          "answer": "It may remove meaningful faint marks.",
          "options": [
            "It may remove meaningful faint marks.",
            "It guarantees correct page orientation.",
            "It forces every word to remain separate."
          ],
          "evidence": "However, cleaning an image too aggressively can remove faint marks that belong to the writing.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "How can a lexicon cause an incorrect reading?",
          "answer": "It can replace an unfamiliar word with a familiar one.",
          "options": [
            "It can replace an unfamiliar word with a familiar one.",
            "It prevents the use of any contextual information.",
            "It makes every historical spelling easier to recognise."
          ],
          "evidence": "A system that replaces an unusual word with a common one can create a plausible but incorrect transcription.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does a high confidence score mean?",
          "answer": "The model assesses a reading as likely, but it may still be wrong.",
          "options": [
            "The model assesses a reading as likely, but it may still be wrong.",
            "The original image no longer needs to be preserved.",
            "Human review is unnecessary for important text."
          ],
          "evidence": "A high score expresses the model's assessment under its training and design, not a guarantee that the reading is correct.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    }
  ]
};
