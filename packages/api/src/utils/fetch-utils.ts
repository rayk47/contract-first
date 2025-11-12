export const performGet = async <T>(path: string) => {
    try {
        const response = await fetch(path, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }
        });
        return await readOrThrowResponse<T>(response);
    } catch (e) {
        console.error('Error performing GET request:', e);
        throw e;
    }
}

export const performPost = async <T, U>(path: string, body: U | undefined) => {
    try {
        const response = await fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined
        });
        return await readOrThrowResponse<T>(response);
    } catch (e) {
        console.error('Error performing POST request:', e);
        throw e;
    }
}

export const performDelete = async (path: string) => {
    try {
        await fetch(path, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    } catch (e) {
        console.error('Error performing DELETE request:', e);
        throw e;
    }
}

export const readOrThrowResponse = async <T>(response: Response) => {
    let value;

    try {
        value = await response.json();
    } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw e;
    }

    if (response.ok) {
        return value as T;
    }

    throw new Error(
        `Failed fetch operation with: ${response.status} ${response.statusText} - ${JSON.stringify(
            value,
            null,
            2
        )}`
    );
}

