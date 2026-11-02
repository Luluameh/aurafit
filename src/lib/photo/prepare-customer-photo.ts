export async function prepareCustomerPhoto(file: File): Promise<{
  file: File;
  backgroundRemoved: boolean;
}> {
  const form = new FormData();
  form.append("file", file, file.name || "customer.jpg");
  const response = await fetch("/api/photo/remove-background", {
    method: "POST",
    body: form,
  });

  if (response.status === 400) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "That photo cannot be used.");
  }

  if (!response.ok) return { file, backgroundRemoved: false };

  const removed = response.headers.get("X-AuraFit-Background") === "removed";
  if (!removed) return { file, backgroundRemoved: false };

  const blob = await response.blob();
  return {
    file: new File([blob], "customer.jpg", { type: "image/jpeg" }),
    backgroundRemoved: true,
  };
}
