import { createContext, useContext, useState, useEffect } from 'react'
import { LanguageCode, LANGUAGES } from '@/lib/constants'

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    'app.name': 'Bringora',
    'app.tagline': 'Connect with Helpers in Your Community',
    'app.subtitle': 'Request help with daily tasks or earn by helping others nearby',
    'nav.requestHelp': 'Request Help',
    'nav.offerHelp': 'Offer Help',
    'nav.signOut': 'Sign Out',
    'card.requestHelp.title': 'Request Help',
    'card.requestHelp.description': 'Request assistance from nearby helpers. Quick, reliable support when you need it most.',
    'card.requestHelp.feature1': 'Real-time tracking',
    'card.requestHelp.feature2': 'Upfront pricing',
    'card.requestHelp.feature3': 'Safe & reliable',
    'card.requestHelp.button': 'Click here →',
    'card.offerHelp.title': 'Offer Help',
    'card.offerHelp.description': 'Make a difference in your community. Help others on your schedule and earn rewards.',
    'card.offerHelp.feature1': 'Flexible hours',
    'card.offerHelp.feature2': 'Weekly payouts',
    'card.offerHelp.feature3': 'In-app support',
    'card.offerHelp.button': 'Click here →',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
  },
  te: {
    'app.name': 'బ్రింగోరా',
    'app.tagline': 'మీ కమ్యూనిటీలో సహాయకులతో కనెక్ట్ అవండి',
    'app.subtitle': 'రోజువారీ పనులకు సహాయం అభ్యర్థించండి లేదా సమీపంలో ఇతరులకు సహాయం చేసి సంపాదించండి',
    'nav.requestHelp': 'సహాయం అభ్యర్థించండి',
    'nav.offerHelp': 'సహాయం అందించండి',
    'nav.signOut': 'సైన్ అవుట్',
    'card.requestHelp.title': 'సహాయం అభ్యర్థించండి',
    'card.requestHelp.description': 'సమీపంలోని సహాయకుల నుండి సహాయం అభ్యర్థించండి. మీకు అవసరమైనప్పుడు వేగవంతమైన, నమ్మకమైన మద్దతు.',
    'card.requestHelp.feature1': 'రియల్-టైమ్ ట్రాకింగ్',
    'card.requestHelp.feature2': 'ముందస్తు ధర',
    'card.requestHelp.feature3': 'సురక్షితమైన మరియు నమ్మకమైన',
    'card.requestHelp.button': 'ఇక్కడ క్లిక్ చేయండి →',
    'card.offerHelp.title': 'సహాయం అందించండి',
    'card.offerHelp.description': 'మీ కమ్యూనిటీలో తేడా చేయండి. మీ షెడ్యూల్ ప్రకారం ఇతరులకు సహాయం చేసి రివార్డ్‌లను సంపాదించండి.',
    'card.offerHelp.feature1': 'అనువైన గంటలు',
    'card.offerHelp.feature2': 'వారానికి చెల్లింపులు',
    'card.offerHelp.feature3': 'అప్-ఇన్ మద్దతు',
    'card.offerHelp.button': 'ఇక్కడ క్లిక్ చేయండి →',
  },
  hi: {
    'app.name': 'ब्रिंगोरा',
    'app.tagline': 'अपने समुदाय में सहायकों से जुड़ें',
    'app.subtitle': 'दैनिक कार्यों के लिए सहायता मांगें या पास में दूसरों की मदद करके कमाएं',
    'nav.requestHelp': 'सहायता मांगें',
    'nav.offerHelp': 'सहायता प्रदान करें',
    'nav.signOut': 'साइन आउट',
    'card.requestHelp.title': 'सहायता मांगें',
    'card.requestHelp.description': 'पास के सहायकों से सहायता मांगें। जब आपको सबसे ज्यादा जरूरत हो तो त्वरित, विश्वसनीय सहायता।',
    'card.requestHelp.feature1': 'रियल-टाइम ट्रैकिंग',
    'card.requestHelp.feature2': 'अग्रिम मूल्य निर्धारण',
    'card.requestHelp.feature3': 'सुरक्षित और विश्वसनीय',
    'card.requestHelp.button': 'यहाँ क्लिक करें →',
    'card.offerHelp.title': 'सहायता प्रदान करें',
    'card.offerHelp.description': 'अपने समुदाय में बदलाव लाएं। अपने समय पर दूसरों की मदद करें और पुरस्कार अर्जित करें।',
    'card.offerHelp.feature1': 'लचीले घंटे',
    'card.offerHelp.feature2': 'साप्ताहिक भुगतान',
    'card.offerHelp.feature3': 'ऐप-इन सहायता',
    'card.offerHelp.button': 'यहाँ क्लिक करें →',
  },
  kn: {
    'app.name': 'ಬ್ರಿಂಗೋರಾ',
    'app.tagline': 'ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ಸಹಾಯಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ',
    'app.subtitle': 'ದೈನಂದಿನ ಕಾರ್ಯಗಳಿಗೆ ಸಹಾಯವನ್ನು ವಿನಂತಿಸಿ ಅಥವಾ ಹತ್ತಿರದಲ್ಲಿ ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಮೂಲಕ ಗಳಿಸಿ',
    'nav.requestHelp': 'ಸಹಾಯ ವಿನಂತಿಸಿ',
    'nav.offerHelp': 'ಸಹಾಯ ನೀಡಿ',
    'nav.signOut': 'ಸೈನ್ ಔಟ್',
    'card.requestHelp.title': 'ಸಹಾಯ ವಿನಂತಿಸಿ',
    'card.requestHelp.description': 'ಹತ್ತಿರದ ಸಹಾಯಕರಿಂದ ಸಹಾಯವನ್ನು ವಿನಂತಿಸಿ. ನಿಮಗೆ ಅತ್ಯಂತ ಅಗತ್ಯವಿರುವಾಗ ತ್ವರಿತ, ವಿಶ್ವಾಸಾರ್ಹ ಬೆಂಬಲ.',
    'card.requestHelp.feature1': 'ರಿಯಲ್-ಟೈಮ್ ಟ್ರ್ಯಾಕಿಂಗ್',
    'card.requestHelp.feature2': 'ಮುಂಚಿತ ಬೆಲೆ',
    'card.requestHelp.feature3': 'ಸುರಕ್ಷಿತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ',
    'card.requestHelp.button': 'ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ →',
    'card.offerHelp.title': 'ಸಹಾಯ ನೀಡಿ',
    'card.offerHelp.description': 'ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ವ್ಯತ್ಯಾಸ ಮಾಡಿ. ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡಿ ಮತ್ತು ಬಹುಮಾನಗಳನ್ನು ಗಳಿಸಿ.',
    'card.offerHelp.feature1': 'ನಮ್ಯ ಗಂಟೆಗಳು',
    'card.offerHelp.feature2': 'ವಾರಕ್ಕೆ ಪಾವತಿಗಳು',
    'card.offerHelp.feature3': 'ಅಪ್-ಇನ್ ಬೆಂಬಲ',
    'card.offerHelp.button': 'ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ →',
  },
  ml: {
    'app.name': 'ബ്രിംഗോര',
    'app.tagline': 'നിങ്ങളുടെ കമ്മ്യൂണിറ്റിയിലെ സഹായകരുമായി കണക്റ്റ് ചെയ്യുക',
    'app.subtitle': 'ദൈനംദിന ജോലികൾക്ക് സഹായം അഭ്യർത്ഥിക്കുക അല്ലെങ്കിൽ സമീപത്തുള്ളവർക്ക് സഹായം നൽകി സമ്പാദിക്കുക',
    'nav.requestHelp': 'സഹായം അഭ്യർത്ഥിക്കുക',
    'nav.offerHelp': 'സഹായം നൽകുക',
    'nav.signOut': 'സൈൻ ഔട്ട്',
    'card.requestHelp.title': 'സഹായം അഭ്യർത്ഥിക്കുക',
    'card.requestHelp.description': 'സമീപത്തുള്ള സഹായകരിൽ നിന്ന് സഹായം അഭ്യർത്ഥിക്കുക. നിങ്ങൾക്ക് ഏറ്റവും ആവശ്യമുള്ളപ്പോൾ വേഗത്തിലുള്ള, വിശ്വസനീയമായ പിന്തുണ.',
    'card.requestHelp.feature1': 'റിയൽ-ടൈം ട്രാക്കിംഗ്',
    'card.requestHelp.feature2': 'മുൻകൂർ വിലനിർണയം',
    'card.requestHelp.feature3': 'സുരക്ഷിതവും വിശ്വസനീയവുമാണ്',
    'card.requestHelp.button': 'ഇവിടെ ക്ലിക്ക് ചെയ്യുക →',
    'card.offerHelp.title': 'സഹായം നൽകുക',
    'card.offerHelp.description': 'നിങ്ങളുടെ കമ്മ്യൂണിറ്റിയിൽ വ്യത്യാസം വരുത്തുക. നിങ്ങളുടെ ഷെഡ്യൂളിൽ മറ്റുള്ളവർക്ക് സഹായം നൽകി പ്രതിഫലം നേടുക.',
    'card.offerHelp.feature1': 'ഗണ്യമായ മണിക്കൂറുകൾ',
    'card.offerHelp.feature2': 'ആഴ്ചയിലെ പേയ്‌മെന്റുകൾ',
    'card.offerHelp.feature3': 'അപ്-ഇൻ പിന്തുണ',
    'card.offerHelp.button': 'ഇവിടെ ക്ലിക്ക് ചെയ്യുക →',
  },
  ta: {
    'app.name': 'பிரிங்கோரா',
    'app.tagline': 'உங்கள் சமூகத்தில் உதவியாளர்களுடன் இணைக்கவும்',
    'app.subtitle': 'தினசரி பணிகளுக்கு உதவி கோரவும் அல்லது அருகிலுள்ளவர்களுக்கு உதவி செய்து சம்பாதிக்கவும்',
    'nav.requestHelp': 'உதவி கோரவும்',
    'nav.offerHelp': 'உதவி வழங்கவும்',
    'nav.signOut': 'வெளியேற',
    'card.requestHelp.title': 'உதவி கோரவும்',
    'card.requestHelp.description': 'அருகிலுள்ள உதவியாளர்களிடமிருந்து உதவி கோரவும். உங்களுக்கு மிகவும் தேவையானபோது விரைவான, நம்பகமான ஆதரவு.',
    'card.requestHelp.feature1': 'நேரடி கண்காணிப்பு',
    'card.requestHelp.feature2': 'முன்கூட்டிய விலை',
    'card.requestHelp.feature3': 'பாதுகாப்பான மற்றும் நம்பகமான',
    'card.requestHelp.button': 'இங்கே கிளிக் செய்யவும் →',
    'card.offerHelp.title': 'உதவி வழங்கவும்',
    'card.offerHelp.description': 'உங்கள் சமூகத்தில் மாற்றத்தை ஏற்படுத்துங்கள். உங்கள் அட்டவணையில் மற்றவர்களுக்கு உதவி செய்து வெகுமதிகளைப் பெறுங்கள்.',
    'card.offerHelp.feature1': 'நெகிழ்வான மணிநேரங்கள்',
    'card.offerHelp.feature2': 'வாராந்திர கொடுப்பனவுகள்',
    'card.offerHelp.feature3': 'ஆப்-இன் ஆதரவு',
    'card.offerHelp.button': 'இங்கே கிளிக் செய்யவும் →',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = localStorage.getItem('language')
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as LanguageCode
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

