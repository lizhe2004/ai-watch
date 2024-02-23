export async function GET({url }: { url: any }) {
 
    let img_url= "https://"+url.searchParams.get('url');
	console.log(img_url);
   
	let headers = new Headers({
		"User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
		'Referer': 'm.douban.com'
	});

	const res = await fetch(img_url);
     const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
       return new Response(buffer);

}