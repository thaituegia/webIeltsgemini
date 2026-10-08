import type { ListeningMockDraft } from "./types.js";

/** Independently authored practice; speech order follows the grouped question booklet. */
export const mock05Draft: ListeningMockDraft = {
  "serial": 5,
  "title": "Listening Mock 05 — Outdoor film, sculpture and testing assumptions",
  "testType": "academic",
  "topics": [
    "Technology",
    "Arts",
    "Education",
    "Science"
  ],
  "parts": [
    {
      "part": 1,
      "title": "Hiring equipment for an outdoor film evening",
      "topic": "Technology",
      "script": [
        [
          "Customer",
          "Hello. I am organising a small film evening in the courtyard of our apartment block, and I was told you hire projection equipment. We have permission from the building manager, but I have never arranged a screening before. I own a laptop, although I suspect its speakers would be too quiet outdoors. Could you help me work out what we actually need without booking a complete concert system?"
        ],
        [
          "Technician",
          "Certainly. The screen and projector are straightforward, but we should discuss the location first. How many people are expected, and can light from surrounding windows reach the screen? A projector that looks bright in a dark living room may struggle outside before sunset."
        ],
        [
          "Customer",
          "There should be about forty people. My surname is Langford, L-A-N-G-F-O-R-D. The courtyard is sheltered from the street, but two security lights stay on all night. We could position the screen away from them. The event is on 17 September, and we plan to start after dusk. I checked the weather averages, though I realise that does not tell us what one particular evening will be like."
        ],
        [
          "Technician",
          "For that group I suggest our compact outdoor package. It has a projector, a three-metre screen and two speakers. The screen is supported on a frame, so you do not need to attach anything to the building. The package costs 138 pounds for one evening. A larger sound system would increase the price without necessarily improving speech clarity in a small enclosed courtyard."
        ],
        [
          "Customer",
          "That is within the budget. I had imagined one speaker beside my laptop, but perhaps two would spread the sound more evenly. We want neighbours to hear the dialogue without making it loud enough to disturb people in other blocks. Can somebody show us how to set the levels? I am worried about adjusting everything while an audience is already waiting for the film to begin."
        ],
        [
          "Technician",
          "We include a setup demonstration at delivery. Start with speech at a comfortable level, then check it from the back row rather than increasing it just because music sounds exciting near the speakers. Keep speakers in front of the audience, not behind the screen. That helps people connect the sound with the picture. You can test with a short scene beforehand, but do not use the loudest moment as your only reference."
        ],
        [
          "Customer",
          "What time can the equipment arrive? Our caretaker opens the courtyard gate at four, and residents may still be carrying bicycles through it until six. I could meet the driver, but I am working until the middle of the afternoon. A delivery before the gate opens would mean leaving several large cases on the pavement, which would be inconvenient and might block pedestrians."
        ],
        [
          "Technician",
          "We can deliver at 16:30. Collection will be at 10:00 the following morning, so the equipment must be kept indoors overnight."
        ],
        [
          "Customer",
          "All right. We have a secure meeting room where the cases can stay. The laptop has only a small connection on the side, not the large one shown in your equipment photograph. I do not know its name. I can send a picture of the ports, if that helps. We also have a wireless internet connection, though it occasionally drops when several people use it at once."
        ],
        [
          "Technician",
          "Send a photograph of the ports and we will supply the correct adapter. Use a downloaded file rather than streaming the film over the courtyard network. Test that file on the laptop before the event, because a successful download does not guarantee that the playback software can open it. You will need one mains socket within eight metres of the projector. We provide the extension cable, but we cannot safely run it across an unprotected public walkway."
        ],
        [
          "Customer",
          "There is a socket beside the meeting-room door. We can arrange chairs so nobody walks over the cable. If rain is forecast, we will move indoors, though the room is much smaller. Is the equipment suitable for that change? I would rather have a reasonable backup plan than promise an outdoor event and cancel at the last minute after everybody has bought refreshments."
        ],
        [
          "Technician",
          "The same projector can be used indoors, but the full screen may not fit. Measure the available wall space before deciding. You may cancel without the hire charge if you notify us by noon on the previous day. After that, the delivery has already been scheduled. I will email the itemised quotation and the weather policy. Reserve the package with a 40-pound deposit, which is deducted from the final bill rather than added as a separate fee. Finally, you will need permission to show the film. Hiring equipment does not include a screening licence. Do not leave the projector under a cover in the courtyard; condensation can still form around it. The delivery contact will be Marcus. Please give him a mobile number when you confirm, but there is no need to read it out until I have completed the quotation."
        ]
      ],
      "questionBlocks": [
        {
          "id": "hire-notes",
          "type": "note",
          "title": "Outdoor screening hire",
          "instructions": "Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          "questionNumbers": [
            1,
            2,
            3,
            4,
            5
          ],
          "text": "Customer surname: {{1}}\nEvent date: {{2}}\nScreen width: {{3}} metres\nEvening package: £{{4}}\nDelivery time: {{5}}."
        },
        {
          "id": "hire-sentences",
          "type": "sentence",
          "title": "Technical requirements",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            6,
            7
          ],
          "text": "Check the laptop connection by sending a {{6}}.\nPlay a downloaded {{7}} instead of streaming."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Surname",
          "answer": "Langford",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "langford"
          ],
          "evidence": "My surname is Langford, L-A-N-G-F-O-R-D.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Date",
          "answer": "17 September",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "17 september"
          ],
          "evidence": "The event is on 17 September, and we plan to start after dusk.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Screen width",
          "answer": "3",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "three"
          ],
          "evidence": "It has a projector, a three-metre screen and two speakers.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Package cost",
          "answer": "138",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "138"
          ],
          "evidence": "The package costs 138 pounds for one evening.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-notes"
        },
        {
          "type": "text",
          "questionType": "note-completion",
          "prompt": "Delivery",
          "answer": "16:30",
          "wordLimit": 2,
          "allowNumbers": true,
          "acceptedAnswers": [
            "16:30",
            "16.30",
            "4:30pm",
            "4.30pm",
            "4:30 pm",
            "4:30",
            "4.30"
          ],
          "evidence": "We can deliver at 16:30.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-notes"
        },
        {
          "type": "text",
          "questionType": "sentence-completion",
          "prompt": "Connection check",
          "answer": "photograph",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "photograph"
          ],
          "evidence": "Send a photograph of the ports and we will supply the correct adapter.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-sentences"
        },
        {
          "type": "text",
          "questionType": "sentence-completion",
          "prompt": "Playback source",
          "answer": "file",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "file"
          ],
          "evidence": "Use a downloaded file rather than streaming the film over the courtyard network.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "hire-sentences"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What is not included in equipment hire?",
          "answer": "Permission to screen the film.",
          "options": [
            "Permission to screen the film.",
            "A setup demonstration.",
            "An extension cable."
          ],
          "evidence": "Hiring equipment does not include a screening licence.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why must the equipment stay indoors overnight?",
          "answer": "A cover would not prevent condensation.",
          "options": [
            "A cover would not prevent condensation.",
            "The frame cannot be taken apart.",
            "The courtyard gate opens before collection."
          ],
          "evidence": "Do not leave the projector under a cover in the courtyard; condensation can still form around it.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "Who will handle delivery?",
          "answer": "Marcus",
          "wordLimit": 1,
          "allowNumbers": false,
          "acceptedAnswers": [
            "marcus"
          ],
          "evidence": "The delivery contact will be Marcus.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        }
      ]
    },
    {
      "part": 2,
      "title": "An introduction to the Millbrook sculpture trail",
      "topic": "Arts",
      "script": [
        [
          "Curator",
          "Welcome to the Millbrook sculpture trail. The works you will see were commissioned for this park, rather than borrowed from a collection and placed wherever there happened to be room. Several artists responded to the site's industrial history, while others considered the movement of people or changes in light. You do not need to recognise an artist's name to enjoy the trail. Look first at what the work does in its setting, then read the interpretation if you want more context. The map shows the river along the southern boundary. The public entrance is on the east side, beside the bus stop. From there, the main path runs west, bends north around the lawn and then continues towards the old mill wall. You will pass a circular fountain just before that northward bend. The listening arch stands southwest of the fountain, at the end of the short branch towards the river. A visitor can stand beneath it and notice how the metal surface changes sounds from nearby water. Please do not strike it; it is not a percussion instrument, even though people sometimes assume that shiny metal must be intended for making noise. After returning to the main path, follow the bend north. The shadow screen stands against the eastern edge of the lawn. Its pattern changes as sunlight passes through the cut shapes. It is still worth seeing on a cloudy day, because the relationship between the open and solid sections remains visible. Continue west from the top of the lawn towards the mill wall. The stone spiral stands just before the path reaches that wall. It is low to the ground, so visitors sometimes walk past while looking for something tall. The spiral was designed to draw attention to texture and gradual changes in stone colour, not to dominate the skyline. Our first live tour begins at 15:10 beside the fountain. There are four ways to explore the trail this afternoon. The artist conversation is intended for people interested in how commissions are developed. It includes discussion of rejected ideas and practical constraints. The family texture hunt is for younger visitors; children compare surfaces using cards rather than rubbing crayons directly on the artwork. The slow-looking session suits adults who want time to examine one piece carefully without moving rapidly from work to work. The audio route is designed for independent visitors and can be followed at any time with a borrowed player. It is not a recording of today's live tour, so please do not expect it to match every temporary activity. Players are collected from the information kiosk and returned there before closing. A refundable deposit is required, but borrowing the player does not cost anything if it comes back complete. Headphones are cleaned between users. You may use your own if you prefer, although wireless headphones cannot connect to these particular devices. The printed route remains available if you would rather explore without audio. The guide will not begin at the entrance, because the bus stop becomes crowded when several vehicles arrive together. The route takes about fifty minutes and includes a short seated pause. Visitors may leave at any point; simply tell the guide so the group does not wait for someone who has chosen to explore independently. A shorter accessible version follows the main paved path and covers the same themes with fewer stops. Photography is welcome, but please avoid blocking the narrow path while taking a long sequence of pictures. Drones are not permitted over the park during public opening. The issue is safety and disturbance, not a ban on photographing sculpture. Some works may be touched gently, and these have a hand symbol on the label. Other surfaces are fragile or change naturally over time, so the absence of that symbol means look without touching. Finally, the trail is a collection of different responses rather than a puzzle with one hidden answer. If your interpretation differs from the artist's statement, compare the two thoughtfully. A useful conversation begins with something you noticed in the work, not with guessing what a visitor is supposed to say."
        ]
      ],
      "visuals": [
        {
          "id": "sculpture-map",
          "type": "map",
          "title": "Millbrook Park sculpture trail",
          "width": 700,
          "height": 500,
          "areas": [
            {
              "id": "lawn",
              "x": 220,
              "y": 150,
              "width": 280,
              "height": 170,
              "fill": "#dceacb"
            },
            {
              "id": "old-wall",
              "x": 50,
              "y": 65,
              "width": 20,
              "height": 200,
              "fill": "#b6aea0"
            }
          ],
          "paths": [
            {
              "id": "main-route",
              "style": "path",
              "points": [
                [
                  660,
                  350
                ],
                [
                  500,
                  350
                ],
                [
                  500,
                  105
                ],
                [
                  70,
                  105
                ]
              ]
            },
            {
              "id": "short-branch",
              "style": "path",
              "points": [
                [
                  550,
                  350
                ],
                [
                  320,
                  420
                ]
              ]
            },
            {
              "id": "river",
              "style": "river",
              "points": [
                [
                  40,
                  465
                ],
                [
                  650,
                  465
                ]
              ]
            }
          ],
          "labels": [
            {
              "id": "entry",
              "x": 615,
              "y": 380,
              "text": "East entrance"
            },
            {
              "id": "fountain",
              "x": 550,
              "y": 350,
              "text": "Fountain"
            },
            {
              "id": "grass",
              "x": 280,
              "y": 225,
              "text": "Lawn"
            },
            {
              "id": "wall-text",
              "x": 80,
              "y": 70,
              "text": "Old mill wall"
            },
            {
              "id": "blank-1",
              "x": 320,
              "y": 415,
              "questionNumber": 1
            },
            {
              "id": "blank-2",
              "x": 505,
              "y": 220,
              "questionNumber": 2
            },
            {
              "id": "blank-3",
              "x": 120,
              "y": 105,
              "questionNumber": 3
            }
          ]
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the work at the end of the branch towards the river.",
          "answer": "listening arch",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "listening arch"
          ],
          "evidence": "The listening arch stands southwest of the fountain, at the end of the short branch towards the river.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "sculpture-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the work beside the lawn's eastern edge.",
          "answer": "shadow screen",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "shadow screen"
          ],
          "evidence": "The shadow screen stands against the eastern edge of the lawn.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "sculpture-map"
        },
        {
          "type": "text",
          "questionType": "map-labelling",
          "prompt": "Name the work just before the old mill wall.",
          "answer": "stone spiral",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "stone spiral"
          ],
          "evidence": "The stone spiral stands just before the path reaches that wall.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information",
          "visualId": "sculpture-map"
        },
        {
          "type": "text",
          "questionType": "short-answer",
          "prompt": "When does the first live tour begin?",
          "answer": "15:10",
          "wordLimit": 1,
          "allowNumbers": true,
          "acceptedAnswers": [
            "15:10",
            "15.10",
            "3:10pm",
            "3.10pm",
            "3:10 pm",
            "3:10",
            "3.10"
          ],
          "evidence": "Our first live tour begins at 15:10 beside the fountain.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "specific-information"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Artist conversation",
          "answer": "commission development",
          "options": [
            "commission development",
            "children's surface comparisons",
            "careful study of one work",
            "independent exploration"
          ],
          "evidence": "The artist conversation is intended for people interested in how commissions are developed.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Family texture hunt",
          "answer": "children's surface comparisons",
          "options": [
            "commission development",
            "children's surface comparisons",
            "careful study of one work",
            "independent exploration"
          ],
          "evidence": "The family texture hunt is for younger visitors; children compare surfaces using cards rather than rubbing crayons directly on the artwork.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Slow-looking session",
          "answer": "careful study of one work",
          "options": [
            "commission development",
            "children's surface comparisons",
            "careful study of one work",
            "independent exploration"
          ],
          "evidence": "The slow-looking session suits adults who want time to examine one piece carefully without moving rapidly from work to work.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Audio route",
          "answer": "independent exploration",
          "options": [
            "commission development",
            "children's surface comparisons",
            "careful study of one work",
            "independent exploration"
          ],
          "evidence": "The audio route is designed for independent visitors and can be followed at any time with a borrowed player.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why does the tour meet away from the entrance?",
          "answer": "Arriving buses make that area crowded.",
          "options": [
            "Arriving buses make that area crowded.",
            "The entrance closes before the tour starts.",
            "The guide cannot identify the bus stop."
          ],
          "evidence": "The guide will not begin at the entrance, because the bus stop becomes crowded when several vehicles arrive together.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "How can visitors tell whether touching is allowed?",
          "answer": "A hand symbol appears on the label.",
          "options": [
            "A hand symbol appears on the label.",
            "Every metal work may be struck.",
            "The audio player gives permission for all surfaces."
          ],
          "evidence": "Some works may be touched gently, and these have a hand symbol on the label.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    },
    {
      "part": 3,
      "title": "Designing a paper-bridge investigation",
      "topic": "Education",
      "script": [
        [
          "Amira",
          "I have brought the bridge sketches. My first design uses a folded sheet, and yours rolls the paper into tubes. We could simply build both and see which holds more weight, but I am worried that we have changed too many things at once. If the tube version wins, we will not know whether that is because of the shape, the amount of paper or the way we joined the pieces."
        ],
        [
          "Ethan",
          "I agree. I used two sheets because one tube seemed too narrow, whereas your folded bridge uses one. We should keep the paper mass constant. The tutor asked us to investigate a design principle, not to make the strongest possible bridge by adding material. We can cut one sheet into strips for the tube design, provided none of the spare paper ends up becoming extra support."
        ],
        [
          "Tutor",
          "You are identifying the right issue. A comparison requires a defined question and controlled conditions. What else must remain the same? Think about the supports and the loading procedure as well as the bridge. A design that survives because it is tested over a shorter gap has not necessarily used its material more efficiently. Decide these details before you see results you might prefer."
        ],
        [
          "Tutor",
          "We should also consider what happens at failure. Failure is also worth observing. A bridge can bend, twist or lose a joint, and those outcomes suggest different explanations. You might photograph each stage, but make sure the camera does not interfere with adding the load. A simple observation sheet may be more reliable than hoping you will remember everything after a dramatic collapse."
        ],
        [
          "Amira",
          "I will record the failure pattern on the sheet. Ethan can add the load, and we can exchange roles for alternate trials so one person's technique does not always belong to one design."
        ],
        [
          "Ethan",
          "We should label each bridge before testing rather than arranging them by how neat they look. Otherwise we might accidentally choose the best folded examples and the worst tube examples. I also want to measure the bend at the centre with a ruler before failure, although it may be difficult to read while the bridge moves."
        ],
        [
          "Tutor",
          "Try that in the pilot. If your measurement is unstable, do not produce a precise-looking number from guesswork. You can describe the limitation and use a simpler comparison. How will you summarise repeated results? The highest successful load is interesting, but selecting only the best result exaggerates what someone could expect from a typical bridge."
        ],
        [
          "Amira",
          "We will display every trial in a small table so that the summary does not conceal inconsistent performance."
        ],
        [
          "Amira",
          "The support gap will be 20 centimetres for every test. I had planned to use desks, but their edges are rounded differently. We can use the wooden blocks from the workshop instead. The bridge will overlap each block by the same distance. We should mark the positions so a small shift does not make one test easier than another."
        ],
        [
          "Amira",
          "We need repeated trials, because a single badly made fold could make a reasonable design appear weak. I suggest five bridges of each shape, built from the same packet of paper."
        ],
        [
          "Ethan",
          "Five seems possible within the session."
        ],
        [
          "Amira",
          "We will report the median load and the range for each design. Those are the two summary measures we agreed on. The median should be less affected by one unusually weak specimen than the mean, while the range shows variation."
        ],
        [
          "Ethan",
          "For loading, I suggested dropping coins into a cup hanging below the centre. Amira pointed out that a falling coin can create a sudden impact. We will add washers gently instead. The washers are equal in mass, and the cup can stay in the same position. We should record the last load held steadily, not just the weight lying in the cup after the bridge has already collapsed."
        ],
        [
          "Ethan",
          "I will make the tube bridges and check the paper mass, while Amira prepares the folded ones and the observation sheet. We should swap one sample before the pilot to check that our instructions are clear. The pilot is on Friday morning. If a joint slips off the support, we must decide whether that counts as structural failure or a problem with the test arrangement before the main trials."
        ],
        [
          "Tutor",
          "Exactly. Write that decision in your method. Your conclusion should explain what the evidence supports about these paper structures under this loading condition. It should not claim that one shape is best for every real bridge. Engineers also consider durability, changing loads and materials with different properties. A controlled small-scale experiment is useful because its question is limited and its assumptions can be checked."
        ]
      ],
      "questionBlocks": [
        {
          "id": "bridge-summary",
          "type": "summary",
          "title": "Bridge investigation details",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            9,
            10
          ],
          "text": "Identical loads are added using {{9}}. The pilot takes place on {{10}}."
        }
      ],
      "questions": [
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Paper quantity",
          "answer": "keep constant",
          "options": [
            "keep constant",
            "observe failure",
            "alternate between trials",
            "show all results"
          ],
          "evidence": "We should keep the paper mass constant.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Failure pattern",
          "answer": "observe failure",
          "options": [
            "keep constant",
            "observe failure",
            "alternate between trials",
            "show all results"
          ],
          "evidence": "I will record the failure pattern on the sheet.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Researcher roles",
          "answer": "alternate between trials",
          "options": [
            "keep constant",
            "observe failure",
            "alternate between trials",
            "show all results"
          ],
          "evidence": "Ethan can add the load, and we can exchange roles for alternate trials so one person's technique does not always belong to one design.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "matching",
          "questionType": "matching",
          "prompt": "Individual trial outcomes",
          "answer": "show all results",
          "options": [
            "keep constant",
            "observe failure",
            "alternate between trials",
            "show all results"
          ],
          "evidence": "We will display every trial in a small table so that the summary does not conceal inconsistent performance.",
          "explanation": "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.",
          "subskill": "matching-features"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why will wooden blocks replace desks?",
          "answer": "Desk edges differ in shape.",
          "options": [
            "Desk edges differ in shape.",
            "The blocks will allow different gaps for each design.",
            "The desks cannot support any paper structure."
          ],
          "evidence": "I had planned to use desks, but their edges are rounded differently.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why are several bridges of each shape needed?",
          "answer": "A single construction flaw could distort the comparison.",
          "options": [
            "A single construction flaw could distort the comparison.",
            "Repeated tests eliminate every possible measurement error.",
            "The tutor requires a different paper type for each trial."
          ],
          "evidence": "We need repeated trials, because a single badly made fold could make a reasonable design appear weak.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO summary measures will the students report?",
          "answer": "median load",
          "options": [
            "median load",
            "only the maximum load",
            "appearance rating",
            "range"
          ],
          "evidence": "We will report the median load and the range for each design.",
          "selectionGroup": {
            "id": "summaries",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "choice-multiple",
          "questionType": "multiple-choice-multiple",
          "prompt": "Which TWO summary measures will the students report?",
          "answer": "range",
          "options": [
            "median load",
            "only the maximum load",
            "appearance rating",
            "range"
          ],
          "evidence": "We will report the median load and the range for each design.",
          "selectionGroup": {
            "id": "summaries",
            "count": 2
          },
          "groupInstructions": "Choose TWO options. Each correct selection earns one mark.",
          "explanation": "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.",
          "subskill": "multiple-selection"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Loading objects",
          "answer": "washers",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "washers"
          ],
          "evidence": "We will add washers gently instead.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bridge-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Pilot day",
          "answer": "Friday",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "friday"
          ],
          "evidence": "The pilot is on Friday morning.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "bridge-summary"
        }
      ]
    },
    {
      "part": 4,
      "title": "Finding evidence of ancient meals",
      "topic": "Science",
      "script": [
        [
          "Lecturer",
          "Archaeologists who investigate food are not usually fortunate enough to find a complete meal waiting to be examined. Most evidence survives as fragments, residues or changes in materials. Today we will consider how those traces can support an argument about eating without pretending that one fragment reveals an entire society's diet. The basic questions include what was available, what people selected and how food was prepared. These questions overlap, but evidence for one does not automatically answer the others. In our exercise, begin by recording context, then separate and identify the remains. Compare the result with evidence from vessels before making a dietary claim. The final stage is to list plausible alternatives and explain which evidence could distinguish them. First consider recovering small plant material. Small remains can be recovered through flotation. Soil is placed in water, and lighter material rises while heavier material stays below. The floating fraction is collected with a fine mesh and dried before identification. This method can reveal tiny seeds that would be missed during ordinary excavation, but it must be controlled carefully. Modern plant material can enter samples, and delicate remains may break during handling. A clean sample is not simply one that looks tidy; it is one whose collection and processing history is documented. Recovered plant remains also need careful interpretation. Seeds may survive when they have been charred, although burning also changes their shape and removes many examples completely. A group of charred grains can show that a crop was present, but it does not establish that people ate it every day. Storage, accidental fire and waste disposal can concentrate material in particular locations. Sampling only the most dramatic deposit would exaggerate its importance. Archaeologists therefore compare several contexts and remain alert to differences in preservation. Animal bones are an obvious source, yet their presence needs interpretation. A bone may have arrived through food preparation, an animal dying naturally or later disturbance. Cut marks can support an explanation involving butchery, while burning may indicate cooking or disposal in a fire. The position of material within the site matters. Bones in a rubbish pit tell a different story from a whole skeleton in a deliberate burial. Researchers record context before removing a sample because that relationship cannot be recovered fully once the objects are separated. Cooking vessels provide another line of evidence. Microscopic examination can identify wear and deposits, and chemical analysis may detect residues from substances once held inside. The presence of a residue does not always identify a complete recipe. A pot may have been reused many times, mixing traces from different activities. Some compounds survive better than others, so absence in the analysis does not prove that a particular food was never cooked. Claims become stronger when several independent forms of evidence support a compatible interpretation. Human remains can sometimes offer information about diet over a longer period. Isotopic patterns may reflect broad differences in food sources, but they are not a menu with named dishes. Interpretation depends on the local environment and the materials compared. Similar measurements can sometimes arise through different combinations of foods. Ethical permission and respectful handling are essential, and not every archaeological question justifies destructive sampling. The decision to analyse a sample must weigh the information expected against the material that will be lost. Social interpretation requires equal caution. A rich collection of food remains in one house may indicate status, an unusual event or better preservation. It should not immediately become a claim that everyone living there ate lavishly every day. Differences between households can be informative, but researchers must consider whether the samples were collected and preserved in comparable ways. A small fragment from an ordinary working area may reveal routine activity more reliably than a spectacular object from a special occasion. Listing alternative explanations is not indecision. It is a method of preventing an appealing story from becoming stronger than the traces that support it. Reconstructing ancient food is most convincing when physical evidence, preservation and the limits of interpretation are discussed together."
        ]
      ],
      "questionBlocks": [
        {
          "id": "food-flow",
          "type": "flow-chart",
          "title": "Investigating food remains",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            1,
            2,
            3,
            4
          ],
          "text": "Record {{1}} → separate and identify {{2}} → compare evidence from {{3}} → list plausible {{4}}."
        },
        {
          "id": "food-summary",
          "type": "summary",
          "title": "Recovering small plant material",
          "instructions": "Write NO MORE THAN TWO WORDS for each answer.",
          "questionNumbers": [
            5,
            6,
            7
          ],
          "text": "Tiny plant remains can be recovered through {{5}}. The light fraction is caught with a fine {{6}}. Preservation may improve when seeds are {{7}}."
        }
      ],
      "questions": [
        {
          "type": "text",
          "questionType": "flow-chart-completion",
          "prompt": "First record",
          "answer": "context",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "context"
          ],
          "evidence": "In our exercise, begin by recording context, then separate and identify the remains.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-flow"
        },
        {
          "type": "text",
          "questionType": "flow-chart-completion",
          "prompt": "Material identified",
          "answer": "remains",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "remains"
          ],
          "evidence": "In our exercise, begin by recording context, then separate and identify the remains.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-flow"
        },
        {
          "type": "text",
          "questionType": "flow-chart-completion",
          "prompt": "Comparative source",
          "answer": "vessels",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "vessels"
          ],
          "evidence": "Compare the result with evidence from vessels before making a dietary claim.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-flow"
        },
        {
          "type": "text",
          "questionType": "flow-chart-completion",
          "prompt": "Final possibilities",
          "answer": "alternatives",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "alternatives"
          ],
          "evidence": "The final stage is to list plausible alternatives and explain which evidence could distinguish them.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-flow"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Recovery method",
          "answer": "flotation",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "flotation"
          ],
          "evidence": "Small remains can be recovered through flotation.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Collection material",
          "answer": "mesh",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "mesh"
          ],
          "evidence": "The floating fraction is collected with a fine mesh and dried before identification.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-summary"
        },
        {
          "type": "text",
          "questionType": "summary-completion",
          "prompt": "Seed condition",
          "answer": "charred",
          "wordLimit": 2,
          "allowNumbers": false,
          "acceptedAnswers": [
            "charred"
          ],
          "evidence": "Seeds may survive when they have been charred, although burning also changes their shape and removes many examples completely.",
          "explanation": "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.",
          "subskill": "completion-and-paraphrase",
          "blockId": "food-summary"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "Why must the location of bones be recorded?",
          "answer": "Different contexts support different explanations.",
          "options": [
            "Different contexts support different explanations.",
            "Bones always indicate food preparation.",
            "Their colour cannot be described after collection."
          ],
          "evidence": "Bones in a rubbish pit tell a different story from a whole skeleton in a deliberate burial.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What limits interpretation of cooking-pot residues?",
          "answer": "The vessel may contain traces of several uses.",
          "options": [
            "The vessel may contain traces of several uses.",
            "Chemical analysis always identifies a complete recipe.",
            "Every ingredient survives equally well."
          ],
          "evidence": "A pot may have been reused many times, mixing traces from different activities.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        },
        {
          "type": "choice",
          "questionType": "multiple-choice",
          "prompt": "What does the lecturer say about listing alternative explanations?",
          "answer": "It helps keep claims proportionate to evidence.",
          "options": [
            "It helps keep claims proportionate to evidence.",
            "It makes physical analysis unnecessary.",
            "It shows that no dietary interpretation is possible."
          ],
          "evidence": "It is a method of preventing an appealing story from becoming stronger than the traces that support it.",
          "explanation": "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.",
          "subskill": "paraphrase-and-distractors"
        }
      ]
    }
  ]
};
