/**
 * Pre-approved static responses used by the safety layer. These never go
 * through an LLM. Helpline numbers should be re-verified before launch.
 */
import type { Locale } from "@/lib/i18n/config";
import type { EmergencyCategory } from "./emergencyKeywords";

type ByLocale = Record<Locale, string>;

const MEDICAL_EMERGENCY: ByLocale = {
  en: `**This may be a medical emergency. Please get help right now.**

- Call **112** (national emergency number) or **108 / 102** (ambulance) immediately.
- Do not wait for the symptoms to pass, and do not travel alone. Ask someone nearby to stay with you.
- If someone is unconscious or not breathing, call for help first. If you are trained, start CPR.
- Tell the operator where you are and what is happening.

I cannot diagnose or treat emergencies in a chat. Please contact emergency services or go to the nearest hospital now.`,
  hi: `**यह एक मेडिकल इमरजेंसी हो सकती है। कृपया अभी मदद लें।**

- तुरंत **112** (राष्ट्रीय आपातकालीन नंबर) या **108 / 102** (एम्बुलेंस) पर कॉल करें।
- लक्षणों के अपने-आप ठीक होने का इंतज़ार न करें, और अकेले यात्रा न करें। आसपास किसी को अपने पास रहने के लिए कहें।
- अगर कोई बेहोश है या साँस नहीं ले रहा, तो पहले मदद के लिए कॉल करें। अगर आप प्रशिक्षित हैं, तो CPR शुरू करें।
- ऑपरेटर को बताएं कि आप कहाँ हैं और क्या हो रहा है।

मैं चैट में आपातकाल का निदान या इलाज नहीं कर सकता। कृपया अभी आपातकालीन सेवाओं से संपर्क करें या नज़दीकी अस्पताल जाएं।`,
};

const MENTAL_HEALTH_CRISIS: ByLocale = {
  en: `**You are not alone, and help is available right now.**

I am really sorry you are going through this. What you are feeling matters, and talking to someone can help.

- If you are in immediate danger or have already hurt yourself, call **112** or **108** now, or go to the nearest hospital.
- **Tele-MANAS: 14416** is a free, 24x7 mental health helpline from the Government of India, available in many languages.
- **KIRAN: 1800-599-0019** is a free, 24x7 mental health helpline.
- Please reach out to someone you trust, such as a family member or friend, and stay with them. Keep anything you could use to hurt yourself out of reach.

I am an information assistant and cannot give counselling, but a trained person can. Please call one of these numbers now.`,
  hi: `**आप अकेले नहीं हैं, और अभी मदद उपलब्ध है।**

मुझे बहुत खेद है कि आप इससे गुज़र रहे हैं। आप जो महसूस कर रहे हैं वह मायने रखता है, और किसी से बात करने से मदद मिल सकती है।

- अगर आप तुरंत खतरे में हैं या खुद को चोट पहुँचा चुके हैं, तो अभी **112** या **108** पर कॉल करें, या नज़दीकी अस्पताल जाएं।
- **टेली-मानस (Tele-MANAS): 14416** भारत सरकार की मुफ़्त, 24x7 मानसिक स्वास्थ्य हेल्पलाइन है, जो कई भाषाओं में उपलब्ध है।
- **किरण (KIRAN): 1800-599-0019** एक मुफ़्त, 24x7 मानसिक स्वास्थ्य हेल्पलाइन है।
- कृपया किसी भरोसेमंद व्यक्ति, जैसे परिवार के सदस्य या मित्र से संपर्क करें और उनके साथ रहें। खुद को नुकसान पहुँचाने वाली चीज़ें अपनी पहुँच से दूर रखें।

मैं एक जानकारी देने वाला सहायक हूँ और काउंसलिंग नहीं दे सकता, लेकिन प्रशिक्षित व्यक्ति दे सकते हैं। कृपया अभी इनमें से किसी नंबर पर कॉल करें।`,
};

export const emergencyResponse = (category: EmergencyCategory, locale: Locale) =>
  (category === "mental-health" ? MENTAL_HEALTH_CRISIS : MEDICAL_EMERGENCY)[locale];

export const harmfulRequestResponse: ByLocale = {
  en: `I cannot help with that. I only share general health awareness information, and I cannot give instructions that could harm you or anyone else.

If you have a health question, such as how to prevent a disease or when to see a doctor, I am happy to help. If you or someone else is in danger, call **112** now.`,
  hi: `मैं इसमें मदद नहीं कर सकता। मैं केवल सामान्य स्वास्थ्य जागरूकता की जानकारी देता हूँ, और ऐसे निर्देश नहीं दे सकता जिनसे आपको या किसी और को नुकसान हो सकता है।

अगर आपका कोई स्वास्थ्य संबंधी प्रश्न है, जैसे किसी बीमारी से बचाव या डॉक्टर को कब दिखाएं, तो मैं खुशी से मदद करूँगा। अगर आप या कोई और खतरे में है, तो अभी **112** पर कॉल करें।`,
};

export const offTopicResponse: ByLocale = {
  en: `I can only help with general health awareness, such as diseases, prevention, vaccination, hygiene and nutrition. Please ask a health-related question.`,
  hi: `मैं केवल सामान्य स्वास्थ्य जागरूकता में मदद कर सकता हूँ, जैसे बीमारियाँ, बचाव, टीकाकरण, स्वच्छता और पोषण। कृपया स्वास्थ्य से जुड़ा प्रश्न पूछें।`,
};

export const noVerifiedInfoResponse: ByLocale = {
  en: `I do not have verified information on this in my knowledge base, so I would rather not guess.

For reliable answers, please talk to a doctor or health worker, or check official sources such as the National Health Portal (nhp.gov.in), the Ministry of Health & Family Welfare (mohfw.gov.in) or WHO (who.int). If it is urgent, call **112** or **108**.`,
  hi: `मेरे ज्ञान-भंडार में इस बारे में सत्यापित जानकारी नहीं है, इसलिए मैं अनुमान लगाकर जवाब नहीं देना चाहता।

भरोसेमंद जानकारी के लिए कृपया डॉक्टर या स्वास्थ्य कार्यकर्ता से बात करें, या राष्ट्रीय स्वास्थ्य पोर्टल (nhp.gov.in), स्वास्थ्य एवं परिवार कल्याण मंत्रालय (mohfw.gov.in) या WHO (who.int) जैसे आधिकारिक स्रोत देखें। अगर यह ज़रूरी है, तो **112** या **108** पर कॉल करें।`,
};

/** Shown when the output guardrail blocks a diagnostic or prescriptive reply. */
export const guardrailFallbackResponse: ByLocale = {
  en: `I can share general health awareness information, but I cannot diagnose a condition or recommend specific medicines or doses.

For a diagnosis or treatment, please see a qualified doctor or visit a nearby health centre. If you feel very unwell, call **112** or **108**.

You can ask me about the general symptoms, causes or prevention of a condition instead.`,
  hi: `मैं सामान्य स्वास्थ्य जागरूकता की जानकारी दे सकता हूँ, लेकिन किसी बीमारी का निदान नहीं कर सकता और न ही विशेष दवाएँ या खुराक सुझा सकता हूँ।

निदान या इलाज के लिए कृपया किसी योग्य डॉक्टर से मिलें या नज़दीकी स्वास्थ्य केंद्र जाएं। अगर आप बहुत अस्वस्थ महसूस कर रहे हैं, तो **112** या **108** पर कॉल करें।

आप इसके बजाय मुझसे किसी बीमारी के सामान्य लक्षण, कारण या बचाव के बारे में पूछ सकते हैं।`,
};
