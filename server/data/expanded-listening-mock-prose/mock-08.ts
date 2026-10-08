import type { ListeningMockDraft } from "./types.js";

/** Independently authored practice; speech order follows the grouped question booklet. */
export const mock08Draft: ListeningMockDraft = {
  "serial": 8,
  "title": "Listening Mock 08 — Energy advice, a book festival and preserving evidence",
  "testType": "general",
  "topics": [
    "Finance",
    "Arts",
    "Health",
    "Science"
  ],
  "parts": [
    {
      "part": 1,
      "title": "Scheduling a home energy-advice visit",
      "topic": "Finance",
      "script": [
        [
          "Adviser",
          "Hello, Town Energy Advice. We offer visits to help residents understand how their homes use energy. We are independent of the companies selling insulation or heating equipment. The visit can identify practical questions and explain options, but it is not a promise of a particular saving. A household's bills depend on behaviour, weather and prices as well as the building itself."
        ],
        [
          "Resident",
          "That is what I wanted to ask about. My bills have increased, but I do not know whether the house is using more energy or the unit price has changed. I also noticed a draught near the front door. I would like somebody to look at the situation before I spend money on improvements suggested by an advertisement. I do not want to replace equipment that still works."
        ],
        [
          "Adviser",
          "We can arrange that. May I take your surname and the street? The adviser needs to know whether it is a house or a flat, because access to shared spaces may require permission. We do not need financial account passwords or card details. A recent bill with the personal account number covered is enough to help explain the figures during the visit."
        ],
        [
          "Resident",
          "My surname is Okafor, O-K-A-F-O-R, and the address is 18 Willow Crescent. It is a terraced house. I own it, so access should not be a problem. I work from home on Fridays, although I am usually in meetings until ten. I could leave a bill on the table and show the adviser the boiler cupboard and the meter when they arrive."
        ],
        [
          "Adviser",
          "There is an appointment on Friday at 10:45. The visit usually takes 90 minutes. The service is free for residents in this district. We will not ask you to sign a purchase agreement afterwards, and you can decide whether to act on any suggestion."
        ],
        [
          "Resident",
          "That is good to know. What should I prepare apart from the bill? I have a folder containing the boiler manual, but some pages are missing. I also have photographs from when the previous owner had work done in the roof space. I am not sure whether they show insulation or just the plasterboard. I would rather admit that than describe the house as having something it may not have."
        ],
        [
          "Adviser",
          "Bring the boiler manual if you have it. Photographs of previous work can also be useful, even when they do not answer every question. Please clear the area around the meter so it can be read safely. There is no need to climb into the roof space before the visit. If access is unsafe or unclear, the adviser will note that limitation rather than ask you to improvise a ladder arrangement. You should remain at home throughout, because the adviser needs to discuss how the rooms are used rather than simply inspect them without context."
        ],
        [
          "Resident",
          "The meter is in a cupboard beside the hallway, so I can move the coats. The front door is where I notice the draught most. Would the adviser check windows as well? Some are quite old, but the room with the oldest window is not always the coldest. I suspect the way we heat the rooms matters, though I do not know how to separate those effects."
        ],
        [
          "Adviser",
          "The adviser will discuss doors, windows and heating controls together. Replacing a window is not automatically the first or most economical step. A setting that suits one room may overheat another, and small draught-proofing measures can sometimes be worth considering before major work. We do not recommend blocking necessary ventilation. The purpose is to understand the home as a system, not to seal every opening without regard to its function."
        ],
        [
          "Resident",
          "Could my partner join the discussion by video? She handles some of the bills and remembers when the controls were last changed. She will be at work that morning, but she could spare twenty minutes. I do not want the adviser to have to repeat everything, although I can take notes. I also want to make sure the person arriving is actually from your service."
        ],
        [
          "Adviser",
          "A short video call is fine if you arrange it on your device. Your adviser is named Aisha and will carry an identity badge. You can telephone our office to confirm it before allowing entry. We send an appointment text the day before, but we do not ask residents to follow a payment link. Afterwards you receive a written summary, which separates observations from suggestions requiring further assessment."
        ],
        [
          "Resident",
          "That sounds very helpful. I will prepare the bill and manual, clear the meter cupboard and let my partner know. If I need to change the appointment, how much notice should I give? If work changes, I would rather free the slot than miss the visit."
        ],
        [
          "Adviser",
          "Please give at least 24 hours' notice if possible. If an unexpected problem occurs later, call us as soon as you can rather than simply leaving the house. We can usually rearrange. I will send the confirmation now. Remember that the visit gives you information for a decision; it does not commit you to a supplier, a new appliance or a contractor chosen by our office."
        ]
      ],
      "questionBlocks": [
        {
          "id": "energy-form",
          "type": "form",
          "title": "Home energy-advice appointment",
          "instructions": "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          "questionNumbers": [
            1,
            2,
            3,
            4,
            5,
            6
          ],
          "rows": [
            {
              "label": "Surname",
              "cells": [
                "{{1}}"
              ]
            },
            {
              "label": "Street",
              "cells": [
                "{{2}}"
              ]
            },
            {
              "label": "Day",
              "cells": [
                "{{3}}"
              ]
            },
            {
              "label": "Start time",
              "cells": [
                "{{4}}"
              ]
            },
            {
              "label": "Duration (minutes)",
              "cells": [
                "{{5}}"
              ]
            },
            {
              "label": "Useful equipment document",
              "cells": [
                "{{6}}"
              ]
            }
          ]
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Surname",
          "answer": "Okafor",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "okafor"
          ],
          "evidence": "My surname is Okafor, O-K-A-F-O-R, and the address is 18 Willow Crescent.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Street",
          "answer": "Willow Crescent",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "willow crescent"
          ],
          "evidence": "My surname is Okafor, O-K-A-F-O-R, and the address is 18 Willow Crescent.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Day",
          "answer": "Friday",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "friday"
          ],
          "evidence": "There is an appointment on Friday at 10:45.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Time",
          "answer": "10:45",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "10:45",
            "10.45",
            "10:45am",
            "10.45am",
            "10:45 am"
          ],
          "evidence": "There is an appointment on Friday at 10:45.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Duration",
          "answer": "90",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "90"
          ],
          "evidence": "The visit usually takes 90 minutes.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Document",
          "answer": "boiler manual",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "boiler manual"
          ],
          "evidence": "Bring the boiler manual if you have it.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "energy-form"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why must the resident remain at home?",
          "answer": "How the rooms are used is relevant to the advice.",
          "options": [
            "How the rooms are used is relevant to the advice.",
            "The resident must approve a purchase contract.",
            "The adviser cannot read a bill independently."
          ],
          "evidence": "You should remain at home throughout, because the adviser needs to discuss how the rooms are used rather than simply inspect them without context.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the adviser say about window replacement?",
          "answer": "It may not be the best first step.",
          "options": [
            "It may not be the best first step.",
            "It is compulsory after every visit.",
            "It always makes draught-proofing unnecessary."
          ],
          "evidence": "Replacing a window is not automatically the first or most economical step.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "What will identify the visiting adviser?",
          "answer": "identity badge",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "identity badge"
          ],
          "evidence": "Your adviser is named Aisha and will carry an identity badge.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "What will the resident receive afterwards?",
          "answer": "written summary",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "written summary"
          ],
          "evidence": "Afterwards you receive a written summary, which separates observations from suggestions requiring further assessment.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        }
      ]
    },
    {
      "part": 2,
      "title": "Finding activities at a riverside book festival",
      "topic": "Arts",
      "script": [
        [
          "Organiser",
          "Welcome to the Daleside Book Festival. This is a temporary site, so the layout differs from the park you may know during the rest of the year. Paths remain open to ordinary walkers, and we should not assume that everybody passing through has a festival ticket. Some activities are free, while others need a booking because the tents have limited seating. Please check the programme rather than judging by the length of a queue. The site map has the river along its northern edge. The main gate is on the west side, opposite the town library. From the gate, the broad path runs east through the centre of the site. The information point is on the south side of that path, close to the entrance, and is already labelled on your map. The poetry tent stands north of the broad path, just beyond the information point. Its entrance faces south, so you can reach it without walking along the riverbank. Continue east to the point where a second path crosses the main one. Turn south there and you will find the children's pavilion. It is set back from the main route to reduce traffic during storytelling sessions. Parents should remain nearby; the activity is not an unattended childcare service. At the same crossroads, the northward path leads to the translation marquee. It is beside the river, but the entrance is on the inland side. Finally, continue east beyond the crossroads. The last venue on the south side is the publishing workshop. The exit gate is farther east and should not be used as an entrance by people hoping to avoid the ticket check. There are four kinds of session today. Author readings focus on hearing a complete extract before questions begin. Translation conversations explore choices between languages and may include more than one possible rendering of a phrase. Publishing workshops are practical sessions in which participants revise a short piece rather than listen only to a lecture. Family storytelling is designed for adults and children to enjoy together, with movement and sound as well as words. None of these activities requires you to have read a particular book beforehand, although familiarity may help you ask a more detailed question. The first poetry reading begins at 11:35. Doors open ten minutes earlier, but please do not reserve several seats with bags while the rest of your group remains outside. Volunteers may ask to move unattended belongings so other visitors can sit. A hearing loop is available in the poetry tent and the translation marquee. Tell the venue steward if you need the relevant seating area or assistance using it. The programme includes a symbol for this facility, but we know that symbols are not always obvious to a first-time visitor. If rain becomes heavy, stewards may close the river path temporarily. That does not mean every session is cancelled. Indoor contingency announcements will appear at the information point and through the programme's official update channel. Please do not repeat an unconfirmed cancellation simply because you hear a visitor say that a tent looks wet. The organiser checks conditions before changing the schedule. Book signing takes place after selected sessions. Buying a book is not required to ask an author a question during the discussion. During signing, however, please keep the line moving and avoid asking for a long private conversation while others wait. The bookstall accepts card payments, but the nearby cafe uses cash as well. Festival volunteers cannot take responsibility for a purchase made through a link someone shares in a queue; use the official stall or the shop identified in the programme. Finally, respectful disagreement is part of a book festival. A speaker may express an opinion you do not share, and a thoughtful question can make the discussion better. Interrupting repeatedly or recording another visitor's personal comment without permission does not help. We hope the site gives you space to discover something unfamiliar, whether that is a new writer, a different language or a practical way to develop your own work."
        ]
      ],
      "visuals": [
        {
          "id": "festival-map",
          "type": "map",
          "title": "Daleside Book Festival site",
          "width": 720,
          "height": 500,
          "paths": [
            {
              "id": "main-path",
              "style": "path",
              "points": [
                [
                  35,
                  260
                ],
                [
                  685,
                  260
                ]
              ]
            },
            {
              "id": "cross-path",
              "style": "path",
              "points": [
                [
                  405,
                  80
                ],
                [
                  405,
                  440
                ]
              ]
            },
            {
              "id": "river",
              "style": "river",
              "points": [
                [
                  35,
                  35
                ],
                [
                  685,
                  35
                ]
              ]
            }
          ],
          "areas": [
            {
              "id": "venue-one",
              "x": 185,
              "y": 140,
              "width": 130,
              "height": 80,
              "fill": "#f0e7df"
            },
            {
              "id": "venue-two",
              "x": 340,
              "y": 355,
              "width": 130,
              "height": 80,
              "fill": "#f0e7df"
            },
            {
              "id": "venue-three",
              "x": 340,
              "y": 75,
              "width": 130,
              "height": 90,
              "fill": "#f0e7df"
            },
            {
              "id": "venue-four",
              "x": 550,
              "y": 300,
              "width": 120,
              "height": 85,
              "fill": "#f0e7df"
            }
          ],
          "labels": [
            {
              "id": "gate",
              "x": 30,
              "y": 290,
              "text": "Main gate"
            },
            {
              "id": "information",
              "x": 100,
              "y": 330,
              "text": "Information point"
            },
            {
              "id": "exit",
              "x": 645,
              "y": 290,
              "text": "Exit gate"
            },
            {
              "id": "blank-one",
              "x": 240,
              "y": 180,
              "questionNumber": 1
            },
            {
              "id": "blank-two",
              "x": 400,
              "y": 395,
              "questionNumber": 2
            },
            {
              "id": "blank-three",
              "x": 400,
              "y": 120,
              "questionNumber": 3
            },
            {
              "id": "blank-four",
              "x": 605,
              "y": 350,
              "questionNumber": 4
            }
          ]
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the venue north of the main path beyond the information point.",
          "answer": "poetry tent",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "poetry tent"
          ],
          "evidence": "The poetry tent stands north of the broad path, just beyond the information point.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "festival-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the venue south of the crossroads.",
          "answer": "children's pavilion",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "children's pavilion"
          ],
          "evidence": "Turn south there and you will find the children's pavilion.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "festival-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the venue north of the crossroads beside the river.",
          "answer": "translation marquee",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "translation marquee"
          ],
          "evidence": "At the same crossroads, the northward path leads to the translation marquee.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "festival-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the venue south of the main path beyond the crossroads.",
          "answer": "publishing workshop",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "publishing workshop"
          ],
          "evidence": "The last venue on the south side is the publishing workshop.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "festival-map"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Author readings",
          "answer": "hear an extract before questions",
          "options": [
            "hear an extract before questions",
            "compare choices between languages",
            "revise a short text",
            "share stories with movement"
          ],
          "evidence": "Author readings focus on hearing a complete extract before questions begin.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Translation conversations",
          "answer": "compare choices between languages",
          "options": [
            "hear an extract before questions",
            "compare choices between languages",
            "revise a short text",
            "share stories with movement"
          ],
          "evidence": "Translation conversations explore choices between languages and may include more than one possible rendering of a phrase.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Publishing workshops",
          "answer": "revise a short text",
          "options": [
            "hear an extract before questions",
            "compare choices between languages",
            "revise a short text",
            "share stories with movement"
          ],
          "evidence": "Publishing workshops are practical sessions in which participants revise a short piece rather than listen only to a lecture.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Family storytelling",
          "answer": "share stories with movement",
          "options": [
            "hear an extract before questions",
            "compare choices between languages",
            "revise a short text",
            "share stories with movement"
          ],
          "evidence": "Family storytelling is designed for adults and children to enjoy together, with movement and sound as well as words.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does closure of the river path indicate?",
          "answer": "Conditions require a local restriction, not necessarily cancellation of sessions.",
          "options": [
            "Conditions require a local restriction, not necessarily cancellation of sessions.",
            "All indoor activities must end.",
            "The official programme is no longer being updated."
          ],
          "evidence": "That does not mean every session is cancelled.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the organiser say about buying a book?",
          "answer": "It is not required to ask a question in a discussion.",
          "options": [
            "It is not required to ask a question in a discussion.",
            "Every visitor must buy one to enter the site.",
            "Purchases should be made through any link shared in a queue."
          ],
          "evidence": "Buying a book is not required to ask an author a question during the discussion.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    },
    {
      "part": 3,
      "title": "Planning sleep diaries for shift workers",
      "topic": "Health",
      "script": [
        [
          "Tutor",
          "Your study concerns shift workers' sleep routines. It is important to define the project as a description of reported experience, not as a medical assessment. A short student study cannot diagnose a sleep disorder or decide whether somebody is fit to work. What information do you need, and how will collecting it avoid placing extra pressure on participants who already have irregular schedules?"
        ],
        [
          "Elena",
          "We want to describe how routines change between workdays and days off. We originally planned one long interview, but people might struggle to remember details from several weeks earlier. We will use daily diaries instead. Each entry should be brief enough to complete without turning the study into another demanding task. We can ask a few follow-up questions afterwards if an entry is unclear."
        ],
        [
          "Samir",
          "I designed an app with several screens, but Elena thought it was too complicated. We will offer a paper diary as well as a simple online form. Participants can choose the format that fits their routine. The questions will be identical in both. We should not confuse being comfortable with a phone interface with being willing to contribute useful information about sleep."
        ],
        [
          "Tutor",
          "That is sensible. Think carefully about the timing of an entry. Asking someone to complete it at a fixed clock time may be unreasonable when their work pattern changes. It may also encourage them to fill several entries at once from memory. A diary works best when the reporting point is connected to the experience you are recording rather than to a schedule convenient only for the researchers."
        ],
        [
          "Samir",
          "We considered asking participants to wear a device, but we do not have suitable equipment for everyone. A few phone apps estimate sleep, although they use different methods. Mixing those readings would make the data look more objective than it really is. We will be clear that duration is self-reported rather than measured by a laboratory instrument."
        ],
        [
          "Elena",
          "We will include a box for an unusual event, with an optional short note. The note might simply say travel or illness; people should not feel obliged to disclose private details. Missing entries will remain missing, not be replaced with a guess based on the previous day."
        ],
        [
          "Elena",
          "We will ask for an entry after the main sleep period, whenever that ends. The diary will record its duration and the participant's rating of restfulness. Those are the two central pieces of information. We also need the shift category, but not the employer's name. That should let us compare broad patterns without collecting details that could identify a person at a particular workplace."
        ],
        [
          "Tutor",
          "Good. How long will the diary run? A single week may not include both work and rest days for every shift pattern. On the other hand, a very long period may increase missing entries. Choose a duration that suits the question and explain the compromise. You can also ask participants whether an unusual event affected a day without requesting a detailed personal account."
        ],
        [
          "Elena",
          "The diary will cover 14 days. That should capture changes for most of the volunteer schedules we have discussed."
        ],
        [
          "Samir",
          "Recruitment will be through a community notice, not through supervisors at work. We do not want employees to think their manager expects them to participate. Volunteers will contact us directly and receive the explanation before agreeing. We will also state that they can stop without giving a reason. A small thank-you payment will recognise time already contributed rather than depend on completing every diary entry."
        ],
        [
          "Tutor",
          "That protects the voluntary nature of the study. Store contact information separately from diary records and use participant codes in the analysis. If somebody includes a workplace name in a free-text note, remove identifying detail from the version used in your presentation. Be equally cautious about displaying a distinctive schedule that could make a person recognisable even without their name."
        ],
        [
          "Elena",
          "The pilot is on Monday. Samir will check the online form and I will prepare the paper version. We will ask pilot volunteers to explain what they thought each question meant. If restfulness is interpreted differently from what we intend, we can revise the wording before the main collection. We should not quietly change it halfway through and compare the answers as if nothing changed."
        ],
        [
          "Samir",
          "For the report, we will show individual patterns with anonymous codes and then summarise similarities. We will avoid ranking people from best to worst sleeper. A difference between workdays and days off may have several explanations, and a diary alone cannot separate them all. The useful outcome is a clear description and a careful discussion of what a larger study could investigate next."
        ]
      ],
      "questionBlocks": [
        {
          "id": "sleep-notes",
          "type": "note",
          "title": "Shift-worker diary study",
          "instructions": "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          "questionNumbers": [
            7,
            8,
            9,
            10
          ],
          "text": "Diary length: {{7}} days\nRecruitment through a community {{8}}\nRecords use participant {{9}}\nPilot day: {{10}}."
        }
      ],
      "questions": [
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why replace one long interview with diaries?",
          "answer": "Recent daily details are easier to report accurately.",
          "options": [
            "Recent daily details are easier to report accurately.",
            "Diaries make the study a medical assessment.",
            "Interviews cannot include any follow-up questions."
          ],
          "evidence": "We originally planned one long interview, but people might struggle to remember details from several weeks earlier.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why offer both paper and online formats?",
          "answer": "Participants have different practical preferences.",
          "options": [
            "Participants have different practical preferences.",
            "The questions will differ between groups.",
            "Only paper entries will be included in the report."
          ],
          "evidence": "Participants can choose the format that fits their routine.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why will phone-app sleep estimates be excluded?",
          "answer": "Different methods could create misleading comparability.",
          "options": [
            "Different methods could create misleading comparability.",
            "All participants already own identical devices.",
            "The tutor wants every duration measured in a laboratory."
          ],
          "evidence": "Mixing those readings would make the data look more objective than it really is.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What will happen to missing entries?",
          "answer": "They will not be replaced with inferred values.",
          "options": [
            "They will not be replaced with inferred values.",
            "They will be copied from the previous day.",
            "They will automatically remove a participant's payment."
          ],
          "evidence": "Missing entries will remain missing, not be replaced with a guess based on the previous day.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO central details does each diary entry record?",
          "answer": "sleep duration",
          "options": [
            "sleep duration",
            "employer's name",
            "a medical diagnosis",
            "restfulness rating"
          ],
          "evidence": "The diary will record its duration and the participant's rating of restfulness.",
          "selectionGroup": {
            "id": "diary-data",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO central details does each diary entry record?",
          "answer": "restfulness rating",
          "options": [
            "sleep duration",
            "employer's name",
            "a medical diagnosis",
            "restfulness rating"
          ],
          "evidence": "The diary will record its duration and the participant's rating of restfulness.",
          "selectionGroup": {
            "id": "diary-data",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Diary length",
          "answer": "14",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "14"
          ],
          "evidence": "The diary will cover 14 days.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "sleep-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Recruitment channel",
          "answer": "notice",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "notice"
          ],
          "evidence": "Recruitment will be through a community notice, not through supervisors at work.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "sleep-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Identifiers",
          "answer": "codes",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "codes"
          ],
          "evidence": "Store contact information separately from diary records and use participant codes in the analysis.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "sleep-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Pilot day",
          "answer": "Monday",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "monday"
          ],
          "evidence": "The pilot is on Monday.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "sleep-notes"
        }
      ]
    },
    {
      "part": 4,
      "title": "Conserving historical textiles",
      "topic": "Science",
      "script": [
        [
          "Lecturer",
          "Historical textiles can preserve information about craft, trade and personal life, but they are also vulnerable materials. A garment may be structurally weak even when its colour remains striking. Today we will discuss conservation as a process of understanding and supporting an object, rather than simply making it look new. Restoration and conservation can overlap, but removing every sign of age is not the automatic goal. Wear may be evidence of how an item was used, and an intervention that improves appearance can sometimes erase useful information. The first stage in our diagram is documentation. The conservator records the object's condition, materials and known history before changing anything. Photographs are made under consistent conditions so later changes can be compared. Seams, repairs and stains are noted, not immediately treated as defects to be removed. Separating original material from later additions can be difficult, and uncertainty should be included in the record. The next stage is testing. Small tests help assess fibres, dyes and the likely response to a proposed treatment. A colour that appears stable in normal viewing may move when exposed to moisture. The process aims to reduce risk, not to create a guarantee that no unexpected change can occur. The final stage in this simplified diagram is support. A fragile textile may need a backing or a specially shaped mount so its weight is distributed safely. Hanging an old garment from two narrow points can place stress on weakened fibres. A support should be designed for the object's form and intended display, not copied from whatever equipment is already in the store. Materials used near the textile must also be chosen carefully, because substances from packaging or adhesives can affect it over time. Environmental control remains important after treatment. Light can fade dyes and weaken fibres, and damage may accumulate without being obvious during one short display. Reducing exposure is therefore more effective than waiting until a change becomes visible. Humidity should remain reasonably stable; rapid fluctuations can contribute to stress and encourage conditions that favour biological damage. The appropriate conditions depend on the material and setting, so a simple number borrowed from another collection is not a complete conservation plan. Pests present a different challenge. Regular inspection looks for signs of insect activity and helps identify a problem before it spreads. Clean storage and careful checking of incoming objects are part of prevention. A treatment chosen in a hurry can damage the textile or expose staff to unnecessary risk, so specialist procedures are used rather than improvised household remedies. The record should include what was found, what action was taken and how its effectiveness will be checked. Display decisions involve interpretation as well as preservation. A viewer may need to understand the garment's shape, but that does not always require placing it on a full mannequin for a long period. Digital images or a replica can sometimes provide context while the original receives a shorter display. A replica must be identified clearly, and photographs should not conceal the distinction. Access can be increased through explanation rather than through exposing the most fragile object continuously. Two cautions explain why conservation takes this careful approach. A repair made by a former owner may explain an alteration in the garment's shape or reveal how people extended its useful life. Different sections of the same textile can respond differently because of repairs, mixed fibres or earlier treatment. For that reason, a successful test in one hidden corner does not justify assuming the whole object will behave identically. In our seminar, you will compare three proposed mounts for a fictional embroidered cloth. Begin with its condition record, identify where the weight would be carried and consider how the support could be inspected later. Then discuss which features of use should remain visible. The best proposal will not necessarily be the one that looks newest. It will protect the material, explain the intervention and preserve the evidence that makes the object worth studying. Conservation is an ongoing relationship between care, access and informed decisions, not a single transformation after which an object becomes permanently safe."
        ]
      ],
      "visuals": [
        {
          "id": "textile-process",
          "type": "process",
          "title": "Simplified textile-care workflow",
          "width": 700,
          "height": 300,
          "labels": [],
          "nodes": [
            {
              "id": "start",
              "x": 15,
              "y": 100,
              "width": 110,
              "height": 75,
              "text": "Initial object"
            },
            {
              "id": "step-one",
              "x": 155,
              "y": 100,
              "width": 130,
              "height": 75,
              "questionNumber": 1
            },
            {
              "id": "step-two",
              "x": 315,
              "y": 100,
              "width": 110,
              "height": 75,
              "questionNumber": 2
            },
            {
              "id": "step-three",
              "x": 455,
              "y": 100,
              "width": 110,
              "height": 75,
              "questionNumber": 3
            },
            {
              "id": "finish",
              "x": 595,
              "y": 100,
              "width": 90,
              "height": 75,
              "text": "Monitoring"
            }
          ],
          "connections": [
            {
              "from": "start",
              "to": "step-one"
            },
            {
              "from": "step-one",
              "to": "step-two"
            },
            {
              "from": "step-two",
              "to": "step-three"
            },
            {
              "from": "step-three",
              "to": "finish"
            }
          ]
        }
      ],
      "questionBlocks": [
        {
          "id": "textile-notes",
          "type": "note",
          "title": "Preservation after treatment",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            4,
            5,
            6,
            7
          ],
          "text": "Exposure to {{4}} may cause fading.\nKeep {{5}} reasonably stable.\nInspection looks for {{6}} activity.\nA clearly identified {{7}} may supply display context."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the initial stage in the illustrated workflow.",
          "answer": "documentation",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "documentation"
          ],
          "evidence": "The first stage in our diagram is documentation.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "textile-process"
        },
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the middle stage in the illustrated workflow.",
          "answer": "testing",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "testing"
          ],
          "evidence": "The next stage is testing.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "textile-process"
        },
        {
          "type": "text",
          "questionType": "diagram-labelling",
          "prompt": "Name the final stage in the illustrated workflow.",
          "answer": "support",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "support"
          ],
          "evidence": "The final stage in this simplified diagram is support.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "textile-process"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Exposure causing fading",
          "answer": "light",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "light"
          ],
          "evidence": "Light can fade dyes and weaken fibres, and damage may accumulate without being obvious during one short display.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "textile-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Environmental condition",
          "answer": "humidity",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "humidity"
          ],
          "evidence": "Humidity should remain reasonably stable; rapid fluctuations can contribute to stress and encourage conditions that favour biological damage.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "textile-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Pest signs",
          "answer": "insect",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "insect"
          ],
          "evidence": "Regular inspection looks for signs of insect activity and helps identify a problem before it spreads.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "textile-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Alternative display object",
          "answer": "replica",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "replica"
          ],
          "evidence": "Digital images or a replica can sometimes provide context while the original receives a shorter display.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "textile-notes"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why are old repairs recorded before treatment?",
          "answer": "They may reveal how the textile was used.",
          "options": [
            "They may reveal how the textile was used.",
            "Every repair must be removed to restore the original colour.",
            "Repairs prove that the original material is strong."
          ],
          "evidence": "A repair made by a former owner may explain an alteration in the garment's shape or reveal how people extended its useful life.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why is one successful treatment test not enough?",
          "answer": "Different sections may respond differently.",
          "options": [
            "Different sections may respond differently.",
            "Tests cannot be performed on any historical textile.",
            "The result depends only on the object's display shape."
          ],
          "evidence": "Different sections of the same textile can respond differently because of repairs, mixed fibres or earlier treatment.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What is the lecturer's main principle for a support proposal?",
          "answer": "Protect the material while preserving and explaining evidence.",
          "options": [
            "Protect the material while preserving and explaining evidence.",
            "Choose whichever mount makes the textile look newest.",
            "Avoid any future inspection once the mount is fitted."
          ],
          "evidence": "It will protect the material, explain the intervention and preserve the evidence that makes the object worth studying.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    }
  ]
};
