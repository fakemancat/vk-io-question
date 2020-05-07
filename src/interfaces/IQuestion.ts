export interface IQuestion {
    resolve: (value?: any) => void;
    startTime: number;
}