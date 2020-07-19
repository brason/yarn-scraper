export enum Brand {
  DROPS = 10430,
  VIKING_GARN = 4115,
  DU_STORE_ALPAKKA = 23139,
  DALE_GARN = 1785,
  MAYFLOWER = 547,
  GJESTAL_GARN = 111,
  NOVITA = 324,
  SANDNES_GARN = 638,
  RAUMA_GARN = 327,
  ISAGER_STRIK = 1063,
  KNIT_AT_HOME = 17856,
  HOUSE_OF_YARN = 6067,
  LANA_GROSSA = 28,
}

export enum Store {
  HOUSE_OF_YARN = "OOeEJ1ZBVEQZ3vQjHOrx",
  GARNIUS = "Q3lhrF9lKa6pF415DX0W",
  GARNKOS = "VNmFyMquD9UBfafrUS4q",
}

export interface Yarn {
  name: string;
  brand: Brand | null;
  price: number;
  url: string;
}

type YarnWeight =
  | "Lace"
  | "Light Fingering"
  | "Fingering"
  | "Sport"
  | "DK"
  | "Worsted"
  | "Aran"
  | "Bulky"
  | "Super Bulky";

export interface YarnData {
  id: number;
  discontinued: boolean;
  gauge_divisor: number;
  grams: number;
  machine_washable?: boolean;
  max_gauge: number;
  min_gauge: number;
  name: string;
  rating_average: number;
  rating_count: number;
  rating_total: number;
  texture: string;
  thread_size?: number;
  yardage: number;
  min_needle_size?: {
    metric: string;
  };
  max_needle_size?: {
    metric: string;
  };
  yarn_weight: {
    name: YarnWeight;
    ply: string;
    wpi: number;
    min_gauge?: number;
    max_gauge?: number;
  };
  yarn_company_name: string;
  yarn_company: {
    id: number;
    name: string;
  };
  photos?: {
    medium2_url: string;
  }[];
  yarn_fibers: {
    fiber_category: {
      name: string;
      synthetic: boolean;
      vegetable_fiber: boolean;
      animal_fiber: boolean;
    };
    fiber_type: {
      name: string;
    };
    percentage: number;
  }[];
}
