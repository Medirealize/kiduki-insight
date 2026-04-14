export type PersonalityGroup = "自分軸" | "相手軸" | "社会軸";

export type TypeCode =
  | "A1" | "A2" | "A3" | "A4"
  | "B1" | "B2" | "B3" | "B4"
  | "C1" | "C2" | "C3" | "C4";

export type CycleNumber =
  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50
  | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60;

export type AnalyzePersonalityResult = {
  typeCode: TypeCode;
  group: PersonalityGroup;
  cycleNumber: CycleNumber;
} | null;

export function analyzePersonality(birthday: string): AnalyzePersonalityResult {
  const date = new Date(birthday);
  if (isNaN(date.getTime())) return null;

  const baseDate = new Date("1900-01-01");
  const diffTime = Math.abs(date.getTime() - baseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const cycleNumber = (diffDays % 60) + 1;
  const typeIndex = Math.floor((cycleNumber - 1) / 5) + 1;

  let group: PersonalityGroup;
  let typeCode: TypeCode;

  if (typeIndex <= 4) {
    group = "自分軸";
    typeCode = `A${typeIndex}` as TypeCode;
  } else if (typeIndex <= 8) {
    group = "相手軸";
    typeCode = `B${typeIndex - 4}` as TypeCode;
  } else {
    group = "社会軸";
    typeCode = `C${typeIndex - 8}` as TypeCode;
  }

  return { typeCode, group, cycleNumber: cycleNumber as CycleNumber };
}
