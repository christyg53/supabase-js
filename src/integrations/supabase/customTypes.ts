export type Database = {
  public: {
    Tables: {
      api_usage: {
        Row: {
          created_at: string;
          function_name: string;
          id: string;
          total_calls: number;
          total_cost: number;
        };
        Insert: {
          created_at?: string;
          function_name: string;
          id?: string;
          total_calls?: number;
          total_cost?: number;
        };
        Update: {
          created_at?: string;
          function_name?: string;
          id?: string;
          total_calls?: number;
          total_cost?: number;
        };
      };
    };
  };
};
