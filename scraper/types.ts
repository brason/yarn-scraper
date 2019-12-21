export interface Yarn {
  name: string;
  brand: string;
  price: number;
  link: string;
}

type YarnWeight =
  | 'Lace'
  | 'Light Fingering'
  | 'Fingering'
  | 'Sport'
  | 'DK'
  | 'Worsted'
  | 'Aran'
  | 'Bulky'
  | 'Super Bulky';

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
  yarn_company: {
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
