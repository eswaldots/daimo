export const RISK_PRE_FILTER =
  /\b(suicid|matarme|matar|morir|quiero\s+morir|cortarme|corté|cortar|odio\s+mi\s+vida|abuso|abusar|tocó|tocaron|secreto\s+entre\s+nosotros|no\s+le\s+diga?s?\s+a\s+nadie|drogas?|coca(ína)?|marihuana|pastillas|violar|violencia|golpear|pegar|desnudo|foto\s+íntima|envíame\s+foto)\b/gi;

export enum RiskCategory {
  SELF_HARM = "self_harm",
  VIOLENCE = "violence",
  ABUSE = "abuse",
  SEXUAL = "sexual",
  DRUGS = "drugs",
  GROOMING = "grooming",
  EMOTIONAL_DISTRESS = "emotional_distress",
}
