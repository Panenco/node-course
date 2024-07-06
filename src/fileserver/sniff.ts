interface SniffSignature {
	match(buff: Uint8Array, offset: number): string
}

// https://mimesniff.spec.whatwg.org/#identifying-a-resource-with-an-unknown-mime-type
const SNIFF_SIGNATURES: SniffSignature[] = [
	HtmlSignature("<!DOCTYPE HTML"),
	HtmlSignature("<HTML"),
	HtmlSignature("<HEAD"),
	HtmlSignature("<SCRIPT"),
	HtmlSignature("<IFRAME"),
	HtmlSignature("<H1"),
	HtmlSignature("<DIV"),
	HtmlSignature("<FONT"),
	HtmlSignature("<TABLE"),
	HtmlSignature("<A"),
	HtmlSignature("<STYLE"),
	HtmlSignature("<TITLE"),
	HtmlSignature("<B"),
	HtmlSignature("<BODY"),
	HtmlSignature("<BR"),
	HtmlSignature("<P"),
	HtmlSignature("<!--"),
]

const SNIFF_LENGTH = 512;
const FALLBACK = "application/octet-stream";

export function sniffContentType(buff: Uint8Array): string {
	if (buff.byteLength > SNIFF_LENGTH) {
		buff = buff.slice(0, SNIFF_LENGTH);
	}

	let whitespaceOffset = 0;
	while (whitespaceOffset < buff.byteLength && isWhitespaceByte(buff[whitespaceOffset])) {
		whitespaceOffset++;
	}

	for (const signature of SNIFF_SIGNATURES) {
		const contentType = signature.match(buff, whitespaceOffset);

		if (contentType !== "") {
			return contentType;
		}
	}


	return FALLBACK;
}

function HtmlSignature(html: string) {

	function match(buff: Uint8Array, offset: number): string {
		buff = buff.slice(offset);

		// 1 for tag terminating byte
		if (buff.byteLength < html.length + 1) {
			return "";
		}

		for (let i = 0; i < html.length; i += 1) {
			const htmlChar = html[i];
			let buffChar = buff[i];
			if ('A' <= htmlChar && htmlChar <= 'Z') {
				buffChar &= 0xDF; // to uppercase
			}

			if (htmlChar !== String.fromCharCode(buffChar)) {
				return "";
			}
		}

		// Next byte must be a tag-terminating byte 0xTT
		if (!isTagTerminatingByte(buff[html.length])) {
			return "";
		}

		return "text/html; charset=utf-8"
	}

	function isTagTerminatingByte(byte: number): boolean {
		return [' ', '>'].includes(String.fromCharCode(byte));
	}

	return {
		match,
		[Symbol("html:value")]: html
	} satisfies SniffSignature;
}


/**
 * Checks whether the provided byte is 0xWS,
 * as defined in https://mimesniff.spec.whatwg.org/#terminology
 * @param byte
 */
function isWhitespaceByte(byte: number) {
	// \t, \n, \f, \r, space
	return [0x09, 0x0A, 0x0C, 0x0D, 0x20].includes(byte);
}
