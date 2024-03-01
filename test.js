async function getVectorsFromAliCloud(textArray:string[],key:string){

	let headers = new Headers({
		"Content-Type": 'application/json',
		'Authorization': `Bearer ${key}&`,
	
	});

	let body ={
		"model":"text-embedding-v2",
		"input":{
			"texts":textArray
		},
		"parameters": {
    		"text_type": "document"
    }
	}
	const vector_url = "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding"
	let tm2 = new Date().getTime();
	const response = await fetch(vector_url, {
		method: 'POST',
		headers: headers,
		body:body
		
	});
	var data = response.json
	return data.output.embeddings;
}
textArray=["",""]
getVectorsFromAliCloud()