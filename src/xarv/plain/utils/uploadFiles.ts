
export async function uploadForm(form: HTMLFormElement, headers: HeadersInit | undefined): Promise<any> {
	try {
		const res = await fetch(form.action, {
			method: "POST",
			headers,
			body: new FormData(form),
		});
		const json = await res.json();
		return json;
	} catch (error) {
		console.error(error);
	}

	return [];
}

export async function uploadFiles(url: string, files: FileList, headers: HeadersInit | undefined, name: string = "files"): Promise<any> {
	try {
		const data = new FormData();
		const a_files = Array.from(files);
		a_files.forEach((file) => data.append(name, file));

		const res = await fetch(url, {
			method: "POST",
			headers,
			body: data,
		});
		const json = await res.json();
		return json;
	} catch (error) {
		console.error(error);
	}

	return [];
}