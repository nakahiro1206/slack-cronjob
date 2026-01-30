import type { ZodTypeAny, z } from "zod";

export class Result<T, E extends Error> {
	private data:
		| {
				type: "ok";
				value: T;
		  }
		| {
				type: "err";
				error: E;
		  };

	constructor(
		data:
			| {
					type: "ok";
					value: T;
			  }
			| {
					type: "err";
					error: E;
			  },
	) {
		this.data = data;
	}

	isOk(): this is { type: "ok"; value: T } {
		return this.data.type === "ok";
	}

	isErr(): this is { type: "err"; error: E } {
		return this.data.type === "err";
	}

	unwrap(): T {
		switch (this.data.type) {
			case "ok":
				return this.data.value;
			case "err":
				throw this.data.error;
		}
	}

	match<U>(ok: (value: T) => U, err: (error: E) => U): U {
		switch (this.data.type) {
			case "ok":
				return ok(this.data.value);
			case "err":
				return err(this.data.error);
		}
	}
}

export const Ok = <T>(value: T): Result<T, Error> => {
	return new Result({
		type: "ok",
		value,
	});
};

export const Err = <T, E extends Error>(error: E): Result<T, E> => {
	return new Result({
		type: "err",
		error,
	});
};

export const safeFetch = async <S extends ZodTypeAny>(
	target: string,
	schema: S,
	input: string | URL | globalThis.Request,
	init?: RequestInit,
): Promise<Result<z.infer<S>, Error>> => {
	try {
		const response = await fetch(input, init);
		if (!response.ok) {
			return Err<z.infer<S>, Error>(
				new Error(`HTTP error! status: ${response.status}`),
			);
		}
		const json = await response.json();
		const parsed = schema.safeParse(json);
		if (!parsed.success) {
			return Err<z.infer<S>, Error>(
				new Error(`Invalid response: ${JSON.stringify(parsed.error)}`),
			);
		}
		return Ok(parsed.data);
	} catch (error) {
		return Err<z.infer<S>, Error>(
			new Error(`Failed to fetch ${target}: ${error}`),
		);
	}
};
