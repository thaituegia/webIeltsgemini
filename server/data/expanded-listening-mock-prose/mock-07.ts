import type { ListeningMockDraft } from "./types.js";

/** Independently authored practice; speech order follows the grouped question booklet. */
export const mock07Draft: ListeningMockDraft = {
  "serial": 7,
  "title": "Listening Mock 07 — Settling in, excavation and changing scales",
  "testType": "academic",
  "topics": [
    "Health",
    "Arts",
    "Transport",
    "Science"
  ],
  "parts": [
    {
      "part": 1,
      "title": "Enrolling a rescue dog in a settling-in class",
      "topic": "Health",
      "script": [
        [
          "Coordinator",
          "Good morning, Willow Dog Centre. Our group classes focus on everyday handling and helping dogs settle with their owners. They are not suitable for every behaviour problem, so I will ask a few questions before recommending a session. If a dog has been biting or seems suddenly unwell, individual assessment or veterinary advice may be more appropriate than putting it into a group."
        ],
        [
          "Owner",
          "I understand. I adopted a dog from a rescue centre last month. She is nervous around busy streets, but she has not bitten anyone. At home she is quite relaxed and follows me around. I would like to help her feel comfortable when we go out, rather than teach her tricks. The rescue centre suggested a small class where I can learn what to notice."
        ],
        [
          "Coordinator",
          "That sounds like the settling-in course, although the trainer will confirm during the first visit. What is your surname and the dog's name? We keep records for both because owners sometimes bring a different dog later. Please also tell me her age if you know it. An estimate from the rescue centre is fine; we do not need a birthday that nobody can establish accurately."
        ],
        [
          "Owner",
          "My surname is Novak, N-O-V-A-K, and the dog is called Poppy. The rescue centre estimated that she is three years old. I saw a class advertised for Tuesday evenings, but I cannot attend until after six because of work. If that is the only group, perhaps I should wait until my schedule changes rather than arrive late every week."
        ],
        [
          "Coordinator",
          "The Tuesday group is for puppies. The adult settling-in group meets on Wednesday at 18:40. We ask owners to arrive ten minutes early so dogs can enter one at a time instead of crowding the doorway. The course has five sessions. We do not expect nervous dogs to become comfortable instantly, and owners can repeat an exercise at an easier level if the group moves too quickly."
        ],
        [
          "Owner",
          "Wednesday is possible. What does the course cost? I am also unsure about equipment. I bought a retractable lead before realising that she becomes frightened when the handle makes a noise. We now use a short ordinary lead, but I do not know whether the centre requires a particular type. I would rather use something she already recognises than introduce several changes at once."
        ],
        [
          "Coordinator",
          "The total fee is 79 pounds. We do not use retractable leads in the room because the changing length can make it difficult to keep space between dogs. Bring small treats that she already tolerates, rather than a new rich food bought especially for the class. A hungry or uncomfortable dog is not helped by an owner experimenting with unfamiliar snacks."
        ],
        [
          "Owner",
          "She likes the little biscuits supplied by the rescue centre, so I can bring those. Would it help if my partner came too? We both walk her, and I would not want us to give different signals. On the other hand, she might pay more attention to finding us both than to the trainer. I am happy to do the first session alone if that is easier."
        ],
        [
          "Coordinator",
          "One adult handles each dog during an exercise, but a second adult can observe without a further charge. The trainer will explain how to use the same cues at home. Please do not bring children to the first session. We want time to understand the dog's response before adding more activity. Later we can discuss how younger family members can be involved appropriately."
        ],
        [
          "Owner",
          "That makes sense. Is the class outside? Poppy finds rain less worrying than traffic, but sudden loud sounds can make her stop walking. I have tried encouraging her forward, though I am learning that refusing to move may be a sign that the situation is too much. I would like practical guidance instead of assuming she is simply being stubborn."
        ],
        [
          "Coordinator",
          "The first two sessions are in the quiet indoor hall. Later we use the enclosed garden if the trainer thinks the group is ready. The hall entrance is behind the building, away from the roadside gate. Park in the gravel area and follow the blue footprints."
        ],
        [
          "Owner",
          "I can send the required health paperwork today. If she becomes overwhelmed during the class, can we step out? I do not want to feel that leaving for a few minutes means we have failed. I have already noticed that a quiet pause can help her recover, whereas repeating the same encouragement more loudly usually makes both of us tense."
        ],
        [
          "Coordinator",
          "You can use the waiting space whenever needed. Tell the trainer before stepping out so they know where you are. Progress means learning to recognise what your dog can manage, not finishing every exercise regardless of discomfort. Bring a fixed lead and a well-fitting harness. Please send a copy of the vaccination record before the course starts. We ask for that information to protect the group, not to assess how well a rescue centre kept its paperwork. I will email the booking form and a short preparation sheet. Your first session is next Wednesday, and payment is due after we confirm the place rather than during this phone call."
        ]
      ],
      "questionBlocks": [
        {
          "id": "dog-form",
          "type": "form",
          "title": "Settling-in course booking",
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
              "label": "Owner surname",
              "cells": [
                "{{1}}"
              ]
            },
            {
              "label": "Dog name",
              "cells": [
                "{{2}}"
              ]
            },
            {
              "label": "Dog age",
              "cells": [
                "{{3}}"
              ]
            },
            {
              "label": "Course day",
              "cells": [
                "{{4}}"
              ]
            },
            {
              "label": "Start time",
              "cells": [
                "{{5}}"
              ]
            },
            {
              "label": "Full fee (£)",
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
          "answer": "Novak",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "novak"
          ],
          "evidence": "My surname is Novak, N-O-V-A-K, and the dog is called Poppy.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Dog name",
          "answer": "Poppy",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "poppy"
          ],
          "evidence": "My surname is Novak, N-O-V-A-K, and the dog is called Poppy.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Age",
          "answer": "3",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "three"
          ],
          "evidence": "The rescue centre estimated that she is three years old.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Class day",
          "answer": "Wednesday",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "wednesday"
          ],
          "evidence": "The adult settling-in group meets on Wednesday at 18:40.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Class time",
          "answer": "18:40",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "18:40",
            "18.40",
            "6:40pm",
            "6.40pm",
            "6:40 pm",
            "6:40",
            "6.40"
          ],
          "evidence": "The adult settling-in group meets on Wednesday at 18:40.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "text",
          "questionType": "form-completion",
          "prompt": "Fee",
          "answer": "79",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "79"
          ],
          "evidence": "The total fee is 79 pounds.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "dog-form"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What can a second adult do?",
          "answer": "Observe without an extra fee.",
          "options": [
            "Observe without an extra fee.",
            "Bring another dog at no extra cost.",
            "Replace the trainer during exercises."
          ],
          "evidence": "One adult handles each dog during an exercise, but a second adult can observe without a further charge.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "How does the coordinator describe progress?",
          "answer": "Recognising the dog's manageable level.",
          "options": [
            "Recognising the dog's manageable level.",
            "Completing every task despite discomfort.",
            "Avoiding all pauses during the class."
          ],
          "evidence": "Progress means learning to recognise what your dog can manage, not finishing every exercise regardless of discomfort.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "What kind of lead should the owner bring?",
          "answer": "fixed lead",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "fixed lead"
          ],
          "evidence": "Bring a fixed lead and a well-fitting harness.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "Which record must be sent before the course?",
          "answer": "vaccination record",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "vaccination record"
          ],
          "evidence": "Please send a copy of the vaccination record before the course starts.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        }
      ]
    },
    {
      "part": 2,
      "title": "An archaeological excavation open day",
      "topic": "Arts",
      "script": [
        [
          "Site Director",
          "Welcome to the Westmere excavation open day. The site is being investigated before a planned road improvement, and today you can see how evidence is recorded. This is not a treasure hunt. A small fragment found in a clear context may tell us more than an attractive object whose position has been lost. Visitors will remain on marked paths, while the excavation teams continue their work. Please do not step across a rope because an empty patch of ground looks like a convenient shortcut. On the map, the entrance is at the northern edge, opposite the temporary parking area. From there, a path leads south to an open square used for the introductory talk. The main trench lies west of that square and is labelled on your plan. You can view it from the path without entering it. The finds-washing shelter stands east of the square, at the end of a short branch path. Workers clean only material for which washing is appropriate; some fragile objects are left untouched until a specialist has examined them. From the square, follow the path south. At the fork, take the branch southwest to the recording tent. Plans, photographs and notes are checked there. The tent is not a storage place for visitors' bags, because papers need to remain organised and secure. Take the southeast branch instead, and you reach the soil-processing area. Samples are examined there for small remains that might be missed by hand. Finally, return to the entrance path and take the narrow branch west just before the square. The viewing platform overlooks the trench from its northeastern corner. The platform has a capacity limit, and the steward will ask one group to wait until another leaves. This is safer than allowing everyone to crowd onto it to see the same object. Four demonstrations will run during the afternoon. The survey demonstration explains how positions are measured, using a practice area away from the working trench. The pottery demonstration explores how fragments can be compared without assuming every similar piece belonged to the same vessel. The environmental demonstration shows what small plant remains can reveal about a site. The conservation demonstration explains why preserving an object may begin with leaving it in its surrounding material rather than cleaning it immediately. Each activity is a short introduction, not professional training, so please do not take the demonstration as permission to try a technique on something you find elsewhere. The first guided circuit leaves at 13:25 from the talk square. It takes around forty minutes and returns to the same point. There is a shorter route for visitors who cannot manage the uneven southern path. That route includes a live camera view of the soil-processing work, so it provides access to the explanation even without entering that area. Tell the steward if you need the shorter option; you do not have to explain a medical condition to the whole group. Photography is permitted from public paths, but some finds may be covered while they are being assessed. We ask you not to move a cover for a better picture. An object can be damaged by changes in light or temperature, and its context may still be under investigation. The information board shows confirmed interpretations and will be updated when the team has sufficient evidence. A confident guess overheard beside a trench is not necessarily the site's final conclusion. Children can join the practice digging activity using clean sand and replica objects. Nothing recovered in that area is an archaeological discovery, and the replicas stay here for the next group. We make that distinction explicit because excitement should not depend on misleading a child about what they have found. Real excavation involves recording, comparison and patience as well as discovery. Before leaving, please return borrowed helmets at the entrance desk. Their protective value depends on their condition, so staff check them between users. If you notice damage, report it instead of passing the helmet to another visitor. We hope the visit gives you a clearer idea of how careful work turns fragments into evidence, and why uncertainty often remains part of the final account."
        ]
      ],
      "visuals": [
        {
          "id": "excavation-map",
          "type": "map",
          "title": "Westmere excavation visitor route",
          "width": 700,
          "height": 520,
          "areas": [
            {
              "id": "main-trench",
              "x": 50,
              "y": 210,
              "width": 170,
              "height": 170,
              "fill": "#dfd0b7"
            },
            {
              "id": "talk-square",
              "x": 280,
              "y": 200,
              "width": 120,
              "height": 100,
              "fill": "#e6e7df"
            }
          ],
          "paths": [
            {
              "id": "central-route",
              "style": "path",
              "points": [
                [
                  340,
                  35
                ],
                [
                  340,
                  250
                ],
                [
                  340,
                  370
                ]
              ]
            },
            {
              "id": "east-branch",
              "style": "path",
              "points": [
                [
                  340,
                  250
                ],
                [
                  600,
                  250
                ]
              ]
            },
            {
              "id": "west-upper",
              "style": "path",
              "points": [
                [
                  340,
                  160
                ],
                [
                  235,
                  160
                ]
              ]
            },
            {
              "id": "south-fork-left",
              "style": "path",
              "points": [
                [
                  340,
                  370
                ],
                [
                  180,
                  465
                ]
              ]
            },
            {
              "id": "south-fork-right",
              "style": "path",
              "points": [
                [
                  340,
                  370
                ],
                [
                  540,
                  465
                ]
              ]
            }
          ],
          "labels": [
            {
              "id": "entry",
              "x": 300,
              "y": 25,
              "text": "Entrance"
            },
            {
              "id": "trench-label",
              "x": 65,
              "y": 290,
              "text": "Main trench"
            },
            {
              "id": "talk-label",
              "x": 285,
              "y": 250,
              "text": "Talk square"
            },
            {
              "id": "q1",
              "x": 600,
              "y": 235,
              "questionNumber": 1
            },
            {
              "id": "q2",
              "x": 180,
              "y": 470,
              "questionNumber": 2
            },
            {
              "id": "q3",
              "x": 540,
              "y": 470,
              "questionNumber": 3
            },
            {
              "id": "q4",
              "x": 235,
              "y": 170,
              "questionNumber": 4
            }
          ]
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the place east of the talk square.",
          "answer": "finds-washing shelter",
          "wordLimit": 3,
          "allowNumbers": false,
          "acceptedAnswers": [
            "finds washing shelter"
          ],
          "evidence": "The finds-washing shelter stands east of the square, at the end of a short branch path.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "excavation-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the place reached by the southwestern branch.",
          "answer": "recording tent",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "recording tent"
          ],
          "evidence": "At the fork, take the branch southwest to the recording tent.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "excavation-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the place reached by the southeastern branch.",
          "answer": "soil-processing area",
          "wordLimit": 3,
          "allowNumbers": false,
          "acceptedAnswers": [
            "soil processing area"
          ],
          "evidence": "Take the southeast branch instead, and you reach the soil-processing area.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "excavation-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the place overlooking the trench's northeastern corner.",
          "answer": "viewing platform",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "viewing platform"
          ],
          "evidence": "The viewing platform overlooks the trench from its northeastern corner.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "excavation-map"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Survey demonstration",
          "answer": "measuring positions",
          "options": [
            "measuring positions",
            "comparing vessel fragments",
            "studying plant remains",
            "protecting fragile material"
          ],
          "evidence": "The survey demonstration explains how positions are measured, using a practice area away from the working trench.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Pottery demonstration",
          "answer": "comparing vessel fragments",
          "options": [
            "measuring positions",
            "comparing vessel fragments",
            "studying plant remains",
            "protecting fragile material"
          ],
          "evidence": "The pottery demonstration explores how fragments can be compared without assuming every similar piece belonged to the same vessel.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Environmental demonstration",
          "answer": "studying plant remains",
          "options": [
            "measuring positions",
            "comparing vessel fragments",
            "studying plant remains",
            "protecting fragile material"
          ],
          "evidence": "The environmental demonstration shows what small plant remains can reveal about a site.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Conservation demonstration",
          "answer": "protecting fragile material",
          "options": [
            "measuring positions",
            "comparing vessel fragments",
            "studying plant remains",
            "protecting fragile material"
          ],
          "evidence": "The conservation demonstration explains why preserving an object may begin with leaving it in its surrounding material rather than cleaning it immediately.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the shorter accessible route provide?",
          "answer": "A live view of work on the southern part of the site.",
          "options": [
            "A live view of work on the southern part of the site.",
            "Permission to cross the working trench.",
            "Access to the replica-digging area without a steward."
          ],
          "evidence": "That route includes a live camera view of the soil-processing work, so it provides access to the explanation even without entering that area.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why are replicas used in the children's activity?",
          "answer": "To allow practice without pretending it is a real discovery.",
          "options": [
            "To allow practice without pretending it is a real discovery.",
            "To replace objects lost from the working trench.",
            "To let each child take an archaeological object home."
          ],
          "evidence": "Nothing recovered in that area is an archaeological discovery, and the replicas stay here for the next group.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    },
    {
      "part": 3,
      "title": "Evaluating local bus timetable information",
      "topic": "Transport",
      "script": [
        [
          "Zara",
          "I have photographed the timetable boards on three bus routes. Some are clear, while others have so many footnotes that I could not work out which service runs on Saturday. I thought our project could compare the boards by counting the words, but that would not tell us whether the information actually helps someone plan a journey. A short board can still omit something essential."
        ],
        [
          "Mateo",
          "We should ask people to complete realistic planning tasks. For example, they could find a bus that gets them to the hospital before a stated appointment time. We must make clear that it is a fictional appointment, so nobody worries about giving personal medical information. The task could show whether a person notices a change of service rather than just identifying the largest printed departure time."
        ],
        [
          "Tutor",
          "That sounds more useful than ranking boards by appearance. However, participants may already know the route. Familiar users can answer from memory without reading the timetable at all. How will you distinguish successful use of the display from previous knowledge? Also decide whether you are evaluating printed information alone or comparing it with an app. Combining those aims could make the project too large."
        ],
        [
          "Zara",
          "We will test printed information only. We can recruit visitors unfamiliar with the selected routes and ask about prior use before starting. Mateo wanted to include the app because it is popular, but live updates introduce another variable. A printed board may contain accurate scheduled times while the app shows a temporary delay. Those are different kinds of information rather than two designs of the same thing."
        ],
        [
          "Tutor",
          "Pilot that carefully. If a timetable has no service satisfying the arrival deadline, a participant who says there is no suitable journey may be correct. Do not mark an answer wrong simply because it differs from the route you expected. Your scoring sheet should list acceptable alternatives and explain which part of the timetable supports them."
        ],
        [
          "Mateo",
          "On our draft answer boxes, we have removed the route colours so they do not hint at a solution. The final report will show the errors grouped by the decision involved, such as choosing the day or interpreting the transfer. That is more actionable than a single score declaring one board best. A board could work well for ordinary departures but poorly for weekend exceptions."
        ],
        [
          "Zara",
          "We will record answer accuracy and the number of requests for clarification. Those are our two main measures. We considered timing each task, but participants may work at different speeds for reasons unrelated to the display. We will still set a generous time limit so the session does not become exhausting. Any unanswered task will be recorded separately rather than treated as a confident wrong choice."
        ],
        [
          "Mateo",
          "For the task sheets, we should use the same journey requirements. I suggested changing the destination for each board, but one trip might need a transfer and another might not. We will create matched tasks with one transfer in each case. The actual place names can differ, but the decision steps should be comparable. We also need to check that every requested journey is possible."
        ],
        [
          "Mateo",
          "I will prepare the scoring sheet with alternative routes. Zara will draft the task instructions. For clarification requests, we need a standard response, otherwise I might explain a footnote to one participant while Zara only repeats the question to another. We can tell people that the researcher cannot interpret the timetable for them, but can explain the fictional journey requirement."
        ],
        [
          "Tutor",
          "Exactly. The wording of your instructions matters. A statement such as find the quickest route assumes speed is the only priority. Someone may reasonably choose a slightly slower journey with an easier transfer. Decide what the task asks, and avoid judging an answer against an unstated preference. Your project is about information use, not about whether people make the same personal travel choices as you."
        ],
        [
          "Zara",
          "The pilot is scheduled for Thursday. We will use enlarged photographs first, rather than testing outside at busy stops. That lets us identify confusing questions without adding weather and passing traffic. For the main sessions, the photographs will be printed at the actual board size. An enlarged pilot image cannot tell us whether the original small print is readable."
        ],
        [
          "Tutor",
          "A useful conclusion might recommend separating weekday and weekend information or making an exception more visible. Make the recommendation conditional on what you observe. With a small sample you cannot estimate every passenger's experience, but you can identify specific design problems and propose a testable change. That is a worthwhile result without turning the project into a claim about the whole transport network."
        ]
      ],
      "questionBlocks": [
        {
          "id": "bus-notes",
          "type": "note",
          "title": "Timetable usability study",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            7,
            8,
            9,
            10
          ],
          "text": "Each matched journey requires one {{7}}. Mateo prepares the {{8}} sheet. Pilot day: {{9}}. Main photographs use the actual board {{10}}."
        }
      ],
      "questions": [
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why was counting words on boards considered inadequate?",
          "answer": "A short display may still lack needed information.",
          "options": [
            "A short display may still lack needed information.",
            "All boards use the same number of words.",
            "It would require participants to use the app."
          ],
          "evidence": "A short board can still omit something essential.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why will app information be excluded?",
          "answer": "Live updates would add a different variable.",
          "options": [
            "Live updates would add a different variable.",
            "The app never gives accurate departure times.",
            "The tutor has prohibited all digital photographs."
          ],
          "evidence": "Mateo wanted to include the app because it is popular, but live updates introduce another variable.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the tutor say about an unexpected route answer?",
          "answer": "It may be acceptable if the timetable supports it.",
          "options": [
            "It may be acceptable if the timetable supports it.",
            "It must be wrong if it differs from the researchers' route.",
            "It should be accepted only when it is the quickest route."
          ],
          "evidence": "Your scoring sheet should list acceptable alternatives and explain which part of the timetable supports them.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why group errors by decision in the report?",
          "answer": "It points to specific improvements.",
          "options": [
            "It points to specific improvements.",
            "It hides differences between weekdays and weekends.",
            "It avoids showing whether answers were correct."
          ],
          "evidence": "That is more actionable than a single score declaring one board best.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO main measures will be collected?",
          "answer": "answer accuracy",
          "options": [
            "answer accuracy",
            "personal medical details",
            "preference for route colours",
            "clarification requests"
          ],
          "evidence": "We will record answer accuracy and the number of requests for clarification.",
          "selectionGroup": {
            "id": "bus-measures",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO main measures will be collected?",
          "answer": "clarification requests",
          "options": [
            "answer accuracy",
            "personal medical details",
            "preference for route colours",
            "clarification requests"
          ],
          "evidence": "We will record answer accuracy and the number of requests for clarification.",
          "selectionGroup": {
            "id": "bus-measures",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Matched journey feature",
          "answer": "transfer",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "transfer"
          ],
          "evidence": "We will create matched tasks with one transfer in each case.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bus-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Mateo's sheet",
          "answer": "scoring",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "scoring"
          ],
          "evidence": "I will prepare the scoring sheet with alternative routes.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bus-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Pilot day",
          "answer": "Thursday",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "thursday"
          ],
          "evidence": "The pilot is scheduled for Thursday.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bus-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Photo condition",
          "answer": "size",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "size"
          ],
          "evidence": "For the main sessions, the photographs will be printed at the actual board size.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bus-notes"
        }
      ]
    },
    {
      "part": 4,
      "title": "The problem of measuring a coastline",
      "topic": "Science",
      "script": [
        [
          "Lecturer",
          "Asking for the length of a country's coastline sounds like asking for a single factual number. Yet the answer depends on how the measurement is made. A coast contains bays, headlands, rocks and smaller irregularities. A ruler that passes across the mouth of a bay gives a different total from one that follows the bay's edge. The issue is not simply that one surveyor works carelessly. Different scales can produce different, defensible descriptions, provided the method and purpose are stated. Consider measuring a simplified coastline on a map with straight steps. A long step skips small bends. This is known as the coastline paradox. It illustrates why a boundary can become longer as the measuring unit becomes smaller. We should not take that observation to mean that every physical coast literally has infinite length. Real landscapes have material limits, and practical measurements are made at defined resolutions for defined purposes. The important point is that the reported number is connected to the procedure. The map itself introduces limits. Its scale determines which features are represented, while generalisation removes detail to make the drawing readable. A broad map of a whole country cannot show every inlet visible on a local survey. A coastline also changes with time. A survey must state which boundary it uses. A high-water line is different from the water's position at the moment a photograph is taken. Rocky and sandy coasts may require different practical decisions, but the choices should remain consistent within a comparison. Otherwise an apparent change could reflect a new definition rather than a real alteration in the landscape. Survey notes should also say whether offshore islands are included, because adding them changes the object being measured. Modern mapping often uses digital imagery and positioning equipment. These can provide detailed observations, but they do not eliminate the need for judgement. A shadow may obscure the water edge, and vegetation can conceal part of a tidal channel. Automated extraction may follow a strong visual contrast that is not the intended boundary. Reviewing the source image and recording uncertain sections remains important. More data can make a result more useful while also revealing features that a simpler map had omitted. The tide moves the visible water edge, storms can reshape beaches and gradual erosion can alter cliffs. In the classroom exercise, begin by selecting a measurement unit and a boundary definition. Trace the same fictional coast at several step lengths, recording each total. Then plot the relationship between step length and measured length. The curve will help you see how the result changes as more detail is included. Keep the source map constant, so that a change in the total reflects your measuring method rather than a different map. Finally, state the resolution alongside the number you report. A bare total invites the reader to assume more certainty than the method provides. What did the classroom comparison demonstrate? Shorter steps follow more of those bends and usually produce a greater total. Tracing the broad map with an extremely small ruler does not recover the missing details. It merely measures the simplified line more precisely. Precision in the tracing procedure must not be confused with accuracy about a landscape that the source does not fully represent. The required resolution depends on the question. For planning a coastal walking route, accessible paths and cliff crossings may matter more than every tiny indentation in the shore. For habitat mapping, small tidal creeks can be important even when they contribute little to a tourist's route. For comparing national boundaries, a standard measurement convention may be more valuable than maximum local detail. These purposes should not be collapsed into a competition over which published coastline total is the largest. This lesson extends beyond geography. Whenever a figure describes a complex object, ask which features were counted, which were omitted and whether the procedure suits the intended comparison. A careful number is not just a value; it is a value connected to a clear account of how it was obtained."
        ]
      ],
      "questionBlocks": [
        {
          "id": "coast-summary",
          "type": "summary",
          "title": "Coastline measurement",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            1,
            2,
            3,
            4
          ],
          "text": "The measurement problem is called the coastline {{1}}. Map {{2}} removes detail. A survey must define the chosen {{3}}. More detailed observations may come from digital {{4}}."
        },
        {
          "id": "coast-sentences",
          "type": "sentence",
          "title": "Reporting a measurement",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            5,
            6,
            7
          ],
          "text": "The visible shore changes with the {{5}}.\nThe classroom experiment keeps the source {{6}} constant.\nA reported total should include its {{7}}."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Named problem",
          "answer": "paradox",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "paradox"
          ],
          "evidence": "This is known as the coastline paradox.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Map simplification",
          "answer": "generalisation",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "generalisation"
          ],
          "evidence": "Its scale determines which features are represented, while generalisation removes detail to make the drawing readable.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Survey choice",
          "answer": "boundary",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "boundary"
          ],
          "evidence": "A survey must state which boundary it uses.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Digital source",
          "answer": "imagery",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "imagery"
          ],
          "evidence": "Modern mapping often uses digital imagery and positioning equipment.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-summary"
        },
        {
          "type": "text",
          "questionType": "sentence-completion",
          "prompt": "Changing water edge",
          "answer": "tide",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "tide"
          ],
          "evidence": "The tide moves the visible water edge, storms can reshape beaches and gradual erosion can alter cliffs.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-sentences"
        },
        {
          "type": "text",
          "questionType": "sentence-completion",
          "prompt": "Constant source",
          "answer": "map",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "map"
          ],
          "evidence": "Keep the source map constant, so that a change in the total reflects your measuring method rather than a different map.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-sentences"
        },
        {
          "type": "text",
          "questionType": "sentence-completion",
          "prompt": "Reported condition",
          "answer": "resolution",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "resolution"
          ],
          "evidence": "Finally, state the resolution alongside the number you report.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "coast-sentences"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why do shorter measuring steps usually produce a longer total?",
          "answer": "They follow more small bends.",
          "options": [
            "They follow more small bends.",
            "They remove headlands from the calculation.",
            "They make the physical landscape expand."
          ],
          "evidence": "Shorter steps follow more of those bends and usually produce a greater total.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What can very precise tracing of a broad map fail to do?",
          "answer": "Recover detail omitted from the map.",
          "options": [
            "Recover detail omitted from the map.",
            "Measure the simplified line consistently.",
            "Keep the source map unchanged."
          ],
          "evidence": "Tracing the broad map with an extremely small ruler does not recover the missing details.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What principle should guide the choice of resolution?",
          "answer": "It should fit the purpose of the measurement.",
          "options": [
            "It should fit the purpose of the measurement.",
            "It should always produce the largest possible total.",
            "It should ignore differences between habitat and route planning."
          ],
          "evidence": "The required resolution depends on the question.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    }
  ]
};
