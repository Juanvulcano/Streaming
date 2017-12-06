@ws.route('/websocket')
def audio(ws):

    global first_message
    first_message = True
    total_msg = ""
    sample_rate = 44100
    a = 150


    def generator(msg):
        global first_message 
        if first_message and msg is not None: # the first message should be the sample rate
            sample_rate = 44100
            first_message = False
        elif msg is not None:
            audio_as_int_array = numpy.frombuffer(msg, 'i2')
            yield(base64.b64decode(audio_as_int_array))
    while a > 0:
        a = a-1
        print(a)
        msg = ws.receive()
        stream = generator(msg)


        requests = (types.StreamingRecognizeRequest(audio_content=chunk) for chunk in stream)

        config = types.RecognitionConfig(
            encoding=enums.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=44100,
            language_code='en-US')
        streaming_config = types.StreamingRecognitionConfig(config=config)

        client = speech.SpeechClient()
        responses = client.streaming_recognize(streaming_config, requests)

        for response in responses:
            for result in response.results:
                print('Finished: {}'.format(result.is_final))
                print('Stability: {}'.format(result.stability))
                alternatives = result.alternatives
                for alternative in alternatives:
                    print('Confidence: {}'.format(alternative.confidence))
                    print('Transcript: {}'.format(alternative.transcript))