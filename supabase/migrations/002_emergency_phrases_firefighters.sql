-- ===========================================
-- Migration: 002_emergency_phrases_firefighters.sql
-- Remplace les phrases d'urgence "patient" par des phrases
-- destinées aux sapeurs-pompiers (point de vue du pompier)
-- Catégories: medical, fire, reassurance, evacuation, general
-- ===========================================

-- Supprimer les anciennes données (catégories patient obsolètes)
DELETE FROM emergency_phrases;

-- ===========================================
-- MÉDICAL — Le pompier interroge la victime
-- ===========================================
INSERT INTO emergency_phrases (id, category, severity, translations, display_order) VALUES
(gen_random_uuid(), 'medical', 'critical', '{
  "fr": "Où avez-vous mal ?",
  "en": "Where does it hurt?",
  "de": "Wo haben Sie Schmerzen?",
  "it": "Dove le fa male?",
  "es": "¿Dónde le duele?",
  "ru": "Где у вас болит?"
}', 1),
(gen_random_uuid(), 'medical', 'critical', '{
  "fr": "Avez-vous des difficultés à respirer ?",
  "en": "Do you have trouble breathing?",
  "de": "Haben Sie Schwierigkeiten beim Atmen?",
  "it": "Ha difficoltà a respirare?",
  "es": "¿Tiene dificultad para respirar?",
  "ru": "Вам трудно дышать?"
}', 2),
(gen_random_uuid(), 'medical', 'critical', '{
  "fr": "Avez-vous perdu connaissance ?",
  "en": "Did you lose consciousness?",
  "de": "Haben Sie das Bewusstsein verloren?",
  "it": "Ha perso conoscenza?",
  "es": "¿Ha perdido el conocimiento?",
  "ru": "Вы теряли сознание?"
}', 3),
(gen_random_uuid(), 'medical', 'high', '{
  "fr": "Êtes-vous allergique à des médicaments ?",
  "en": "Are you allergic to any medications?",
  "de": "Sind Sie gegen Medikamente allergisch?",
  "it": "È allergico a qualche farmaco?",
  "es": "¿Es alérgico a algún medicamento?",
  "ru": "У вас есть аллергия на лекарства?"
}', 4),
(gen_random_uuid(), 'medical', 'high', '{
  "fr": "Prenez-vous des médicaments ?",
  "en": "Are you taking any medications?",
  "de": "Nehmen Sie Medikamente ein?",
  "it": "Sta assumendo dei farmaci?",
  "es": "¿Está tomando algún medicamento?",
  "ru": "Вы принимаете какие-либо лекарства?"
}', 5),
(gen_random_uuid(), 'medical', 'high', '{
  "fr": "Avez-vous des antécédents médicaux ?",
  "en": "Do you have any medical history?",
  "de": "Haben Sie Vorerkrankungen?",
  "it": "Ha precedenti medici?",
  "es": "¿Tiene antecedentes médicos?",
  "ru": "У вас есть хронические заболевания?"
}', 6),
(gen_random_uuid(), 'medical', 'high', '{
  "fr": "Depuis quand ressentez-vous cette douleur ?",
  "en": "How long have you been feeling this pain?",
  "de": "Seit wann haben Sie diese Schmerzen?",
  "it": "Da quanto tempo ha questo dolore?",
  "es": "¿Desde cuándo siente este dolor?",
  "ru": "Как давно вы чувствуете эту боль?"
}', 7);

-- ===========================================
-- INCENDIE — Le pompier interroge les témoins/victimes
-- ===========================================
INSERT INTO emergency_phrases (id, category, severity, translations, display_order) VALUES
(gen_random_uuid(), 'fire', 'critical', '{
  "fr": "Y a-t-il d''autres personnes à l''intérieur ?",
  "en": "Are there other people inside?",
  "de": "Sind noch andere Personen drinnen?",
  "it": "Ci sono altre persone all''interno?",
  "es": "¿Hay otras personas adentro?",
  "ru": "Есть ли другие люди внутри?"
}', 1),
(gen_random_uuid(), 'fire', 'critical', '{
  "fr": "Combien de personnes sont à l''intérieur ?",
  "en": "How many people are inside?",
  "de": "Wie viele Personen sind drinnen?",
  "it": "Quante persone sono all''interno?",
  "es": "¿Cuántas personas están adentro?",
  "ru": "Сколько людей внутри?"
}', 2),
(gen_random_uuid(), 'fire', 'critical', '{
  "fr": "Où se trouvent-elles ?",
  "en": "Where are they?",
  "de": "Wo befinden sie sich?",
  "it": "Dove si trovano?",
  "es": "¿Dónde están?",
  "ru": "Где они находятся?"
}', 3),
(gen_random_uuid(), 'fire', 'high', '{
  "fr": "Y a-t-il des produits dangereux à l''intérieur ?",
  "en": "Are there any hazardous materials inside?",
  "de": "Gibt es Gefahrstoffe im Gebäude?",
  "it": "Ci sono materiali pericolosi all''interno?",
  "es": "¿Hay materiales peligrosos adentro?",
  "ru": "Есть ли опасные вещества внутри?"
}', 4),
(gen_random_uuid(), 'fire', 'high', '{
  "fr": "Depuis combien de temps l''incendie a-t-il commencé ?",
  "en": "How long has the fire been burning?",
  "de": "Seit wann brennt es?",
  "it": "Da quanto tempo brucia l''incendio?",
  "es": "¿Desde cuándo está el incendio?",
  "ru": "Как давно начался пожар?"
}', 5);

-- ===========================================
-- RÉCONFORT — Le pompier rassure la victime
-- ===========================================
INSERT INTO emergency_phrases (id, category, severity, translations, display_order) VALUES
(gen_random_uuid(), 'reassurance', 'medium', '{
  "fr": "Nous sommes là pour vous aider.",
  "en": "We are here to help you.",
  "de": "Wir sind hier, um Ihnen zu helfen.",
  "it": "Siamo qui per aiutarvi.",
  "es": "Estamos aquí para ayudarle.",
  "ru": "Мы здесь, чтобы вам помочь."
}', 1),
(gen_random_uuid(), 'reassurance', 'medium', '{
  "fr": "Restez calme, les secours sont là.",
  "en": "Stay calm, help is here.",
  "de": "Bleiben Sie ruhig, Hilfe ist da.",
  "it": "Stia calmo, i soccorsi sono qui.",
  "es": "Mantenga la calma, la ayuda está aquí.",
  "ru": "Сохраняйте спокойствие, помощь здесь."
}', 2),
(gen_random_uuid(), 'reassurance', 'medium', '{
  "fr": "Tout va bien se passer.",
  "en": "Everything will be fine.",
  "de": "Alles wird gut.",
  "it": "Andrà tutto bene.",
  "es": "Todo va a salir bien.",
  "ru": "Всё будет хорошо."
}', 3),
(gen_random_uuid(), 'reassurance', 'medium', '{
  "fr": "Nous allons prendre soin de vous.",
  "en": "We will take care of you.",
  "de": "Wir kümmern uns um Sie.",
  "it": "Ci prenderemo cura di lei.",
  "es": "Vamos a cuidar de usted.",
  "ru": "Мы позаботимся о вас."
}', 4),
(gen_random_uuid(), 'reassurance', 'medium', '{
  "fr": "Les secours sont en route.",
  "en": "Help is on the way.",
  "de": "Hilfe ist unterwegs.",
  "it": "I soccorsi stanno arrivando.",
  "es": "La ayuda está en camino.",
  "ru": "Помощь уже в пути."
}', 5);

-- ===========================================
-- ÉVACUATION — Le pompier guide l'évacuation
-- ===========================================
INSERT INTO emergency_phrases (id, category, severity, translations, display_order) VALUES
(gen_random_uuid(), 'evacuation', 'critical', '{
  "fr": "Nous devons évacuer le bâtiment.",
  "en": "We need to evacuate the building.",
  "de": "Wir müssen das Gebäude evakuieren.",
  "it": "Dobbiamo evacuare l''edificio.",
  "es": "Debemos evacuar el edificio.",
  "ru": "Нам нужно эвакуировать здание."
}', 1),
(gen_random_uuid(), 'evacuation', 'high', '{
  "fr": "Suivez-moi, s''il vous plaît.",
  "en": "Please follow me.",
  "de": "Bitte folgen Sie mir.",
  "it": "Per favore, mi segua.",
  "es": "Por favor, sígame.",
  "ru": "Пожалуйста, следуйте за мной."
}', 2),
(gen_random_uuid(), 'evacuation', 'high', '{
  "fr": "Ne prenez pas l''ascenseur.",
  "en": "Do not use the elevator.",
  "de": "Benutzen Sie nicht den Aufzug.",
  "it": "Non prendete l''ascensore.",
  "es": "No use el ascensor.",
  "ru": "Не пользуйтесь лифтом."
}', 3),
(gen_random_uuid(), 'evacuation', 'high', '{
  "fr": "Utilisez les escaliers.",
  "en": "Use the stairs.",
  "de": "Benutzen Sie die Treppe.",
  "it": "Usate le scale.",
  "es": "Use las escaleras.",
  "ru": "Используйте лестницу."
}', 4),
(gen_random_uuid(), 'evacuation', 'critical', '{
  "fr": "Restez baissé pour éviter la fumée.",
  "en": "Stay low to avoid the smoke.",
  "de": "Bleiben Sie niedrig, um den Rauch zu vermeiden.",
  "it": "Restate bassi per evitare il fumo.",
  "es": "Agáchese para evitar el humo.",
  "ru": "Пригнитесь, чтобы избежать дыма."
}', 5);

-- ===========================================
-- GÉNÉRAL — Communication de base
-- ===========================================
INSERT INTO emergency_phrases (id, category, severity, translations, display_order) VALUES
(gen_random_uuid(), 'general', 'medium', '{
  "fr": "Comment vous appelez-vous ?",
  "en": "What is your name?",
  "de": "Wie heißen Sie?",
  "it": "Come si chiama?",
  "es": "¿Cómo se llama?",
  "ru": "Как вас зовут?"
}', 1),
(gen_random_uuid(), 'general', 'high', '{
  "fr": "Comprenez-vous ce que je dis ?",
  "en": "Do you understand what I''m saying?",
  "de": "Verstehen Sie, was ich sage?",
  "it": "Capisce quello che dico?",
  "es": "¿Entiende lo que digo?",
  "ru": "Вы понимаете, что я говорю?"
}', 2),
(gen_random_uuid(), 'general', 'medium', '{
  "fr": "Pouvez-vous parler plus lentement ?",
  "en": "Can you speak more slowly?",
  "de": "Können Sie langsamer sprechen?",
  "it": "Può parlare più lentamente?",
  "es": "¿Puede hablar más despacio?",
  "ru": "Вы можете говорить медленнее?"
}', 3),
(gen_random_uuid(), 'general', 'medium', '{
  "fr": "Avez-vous besoin d''un interprète ?",
  "en": "Do you need an interpreter?",
  "de": "Brauchen Sie einen Dolmetscher?",
  "it": "Ha bisogno di un interprete?",
  "es": "¿Necesita un intérprete?",
  "ru": "Вам нужен переводчик?"
}', 4),
(gen_random_uuid(), 'general', 'medium', '{
  "fr": "Pouvez-vous appeler quelqu''un qui parle français ?",
  "en": "Can you call someone who speaks French?",
  "de": "Können Sie jemanden anrufen, der Französisch spricht?",
  "it": "Può chiamare qualcuno che parla francese?",
  "es": "¿Puede llamar a alguien que hable francés?",
  "ru": "Вы можете позвонить кому-то, кто говорит по-французски?"
}', 5),
(gen_random_uuid(), 'general', 'medium', '{
  "fr": "Avez-vous un téléphone ?",
  "en": "Do you have a phone?",
  "de": "Haben Sie ein Telefon?",
  "it": "Ha un telefono?",
  "es": "¿Tiene un teléfono?",
  "ru": "У вас есть телефон?"
}', 6);
