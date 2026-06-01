export type ValidationResult<T> =
  | { data: T; ok: true }
  | { message: string; ok: false };

type PostPayload = {
  content: string;
  nickname: string;
  password: string;
  title: string;
};

type CommentPayload = {
  content: string;
  nickname: string;
  password: string;
};

type PasswordPayload = {
  password: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requireLength(value: string, label: string, min: number, max: number) {
  if (value.length < min) {
    return `${label}을(를) ${min}자 이상 입력해주세요.`;
  }

  if (value.length > max) {
    return `${label}은(는) ${max}자 이하로 입력해주세요.`;
  }

  return null;
}

export function validatePostPayload(body: unknown): ValidationResult<PostPayload> {
  const source = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const payload = {
    content: normalizeText(source.content),
    nickname: normalizeText(source.nickname),
    password: normalizeText(source.password),
    title: normalizeText(source.title),
  };

  const error =
    requireLength(payload.nickname, "닉네임", 2, 24) ??
    requireLength(payload.password, "임시 비밀번호", 4, 64) ??
    requireLength(payload.title, "제목", 2, 80) ??
    requireLength(payload.content, "본문", 5, 2_000);

  return error ? { message: error, ok: false } : { data: payload, ok: true };
}

export function validateCommentPayload(body: unknown): ValidationResult<CommentPayload> {
  const source = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const payload = {
    content: normalizeText(source.content),
    nickname: normalizeText(source.nickname),
    password: normalizeText(source.password),
  };

  const error =
    requireLength(payload.nickname, "닉네임", 2, 24) ??
    requireLength(payload.password, "임시 비밀번호", 4, 64) ??
    requireLength(payload.content, "댓글", 2, 700);

  return error ? { message: error, ok: false } : { data: payload, ok: true };
}

export function validatePasswordPayload(body: unknown): ValidationResult<PasswordPayload> {
  const source = typeof body === "object" && body ? (body as Record<string, unknown>) : {};
  const payload = {
    password: normalizeText(source.password),
  };

  const error = requireLength(payload.password, "임시 비밀번호", 4, 64);

  return error ? { message: error, ok: false } : { data: payload, ok: true };
}
