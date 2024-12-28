export type ResponseServerType = {
    type: 'message' | 'offer' | 'ice-candidate' | 'answer' | 'hang-up' | 'close-other-webcam',
    data: any
}