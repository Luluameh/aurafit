import { getYouCamApiKey, YOUCAM_BASE_URL } from "./config";

export type GarmentCategory =
  | "auto"
  | "full_body"
  | "upper_body"
  | "lower_body"
  | "shoes";

type YouCamStatusResponse<T> = {
  status: number;
  data: T;
};

type FileInitEntry = {
  file_id: string;
  requests: Array<{
    method: string;
    url: string;
    headers?: Record<string, string>;
  }>;
};

type TaskCreateResponse = {
  task_id: string;
};

export type TaskPollData = {
  task_status: "running" | "success" | "error" | string;
  results?: { url?: string };
  error_message?: string;
};

export type SkinToneColorResult = {
  eye_color?: string;
  eye_color_name?: string;
  lip_color?: string;
  eyebrow_color?: string;
  skin_color?: string;
  hair_color?: string;
  hair_color_name?: string;
};

export type SkinToneTaskData = {
  task_status: "running" | "success" | "error" | string;
  error?: string;
  error_message?: string;
  results?: {
    color?: SkinToneColorResult;
    face_quality?: {
      has_face?: boolean;
      area?: string;
      frontal?: string;
      lighting?: string;
      faceangle?: string;
    };
  };
};

async function youcamFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<YouCamStatusResponse<T>> {
  const apiKey = getYouCamApiKey();
  const res = await fetch(`${YOUCAM_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const json = (await res.json()) as YouCamStatusResponse<T>;
  if (!res.ok || json.status !== 200) {
    throw new Error(
      `YouCam API error (${path}): ${JSON.stringify(json).slice(0, 500)}`,
    );
  }
  return json;
}

/** Upload binary via signed URL; returns file_id for try-on tasks. */
export async function uploadClothImage(
  fileName: string,
  contentType: string,
  fileSize: number,
  body: ArrayBuffer,
): Promise<string> {
  const init = await youcamFetch<{ files: FileInitEntry[] }>(
    "/s2s/v2.0/file/cloth-v4",
    {
      method: "POST",
      body: JSON.stringify({
        files: [
          {
            content_type: contentType,
            file_name: fileName,
            file_size: fileSize,
          },
        ],
      }),
    },
  );

  const entry = init.data.files[0];
  const put = entry.requests[0];
  const putRes = await fetch(put.url, {
    method: put.method ?? "PUT",
    headers: {
      "Content-Type": contentType,
      ...(put.headers ?? {}),
    },
    body,
  });

  if (!putRes.ok) {
    throw new Error(`YouCam file upload failed: ${putRes.status}`);
  }

  return entry.file_id;
}

/** Generic file upload for skin tone and other non-cloth-v4 tasks. */
export async function uploadYouCamFile(
  fileName: string,
  contentType: string,
  fileSize: number,
  body: ArrayBuffer,
): Promise<string> {
  const init = await youcamFetch<{ files: FileInitEntry[] }>("/s2s/v2.0/file", {
    method: "POST",
    body: JSON.stringify({
      files: [
        {
          content_type: contentType,
          file_name: fileName,
          file_size: fileSize,
        },
      ],
    }),
  });

  const entry = init.data.files[0];
  const put = entry.requests[0];
  const putRes = await fetch(put.url, {
    method: put.method ?? "PUT",
    headers: {
      "Content-Type": contentType,
      ...(put.headers ?? {}),
    },
    body,
  });

  if (!putRes.ok) {
    throw new Error(`YouCam file upload failed: ${putRes.status}`);
  }

  return entry.file_id;
}

export async function createClothTryOnTask(input: {
  srcFileId?: string;
  srcFileUrl?: string;
  refFileId?: string;
  refFileUrl?: string;
  garmentCategory?: GarmentCategory;
}): Promise<string> {
  const payload: Record<string, string | boolean> = {
    garment_category: input.garmentCategory ?? "auto",
    change_shoes: input.garmentCategory === "shoes",
  };

  if (input.srcFileId) payload.src_file_id = input.srcFileId;
  else if (input.srcFileUrl) payload.src_file_url = input.srcFileUrl;
  else throw new Error("Person image (src) is required");

  if (input.refFileId) payload.ref_file_id = input.refFileId;
  else if (input.refFileUrl) payload.ref_file_url = input.refFileUrl;
  else throw new Error("Garment image (ref) is required");

  const created = await youcamFetch<TaskCreateResponse>(
    "/s2s/v2.0/task/cloth-v4",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return created.data.task_id;
}

export async function getClothTryOnTask(
  taskId: string,
): Promise<TaskPollData> {
  const result = await youcamFetch<TaskPollData>(
    `/s2s/v2.0/task/cloth-v4/${encodeURIComponent(taskId)}`,
    { method: "GET" },
  );
  return result.data;
}

export async function createSkinToneAnalysisTask(input: {
  srcFileId?: string;
  srcFileUrl?: string;
  faceAngleStrictness?: "strict" | "high" | "medium" | "low" | "flexible";
}): Promise<string> {
  const payload: Record<string, string> = {
    face_angle_strictness_level: input.faceAngleStrictness ?? "medium",
  };

  if (input.srcFileId) payload.src_file_id = input.srcFileId;
  else if (input.srcFileUrl) payload.src_file_url = input.srcFileUrl;
  else throw new Error("Person image (src) is required for skin tone analysis");

  const created = await youcamFetch<TaskCreateResponse>(
    "/s2s/v2.0/task/skin-tone-analysis",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return created.data.task_id;
}

export async function getSkinToneAnalysisTask(taskId: string): Promise<SkinToneTaskData> {
  const result = await youcamFetch<SkinToneTaskData>(
    `/s2s/v2.0/task/skin-tone-analysis/${encodeURIComponent(taskId)}`,
    { method: "GET" },
  );
  return result.data;
}
