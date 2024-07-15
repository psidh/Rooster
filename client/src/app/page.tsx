"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiGithub } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const socket = io("http://localhost:9001");

interface ProjectResponse {
  data: {
    projectSlug: string;
    url: string;
  };
}

interface LogMessage {
  log: string;
  complete: boolean;
}

export default function Home() {
  const [repoURL, setURL] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();

  const [showDeployedURL, setShowDeployedURL] = useState(false);
  const [deployedURL, setDeployedURL] = useState<string | undefined>();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const isValidURL = useMemo((): boolean => {
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/;
    return regex.test(repoURL);
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    setLoading(true);
    toast.loading("Deploying project...");

    try {
      const { data } = await axios.post<ProjectResponse>(
        "https://rooster-g5l3.onrender.com/",
        {
          gitURL: repoURL,
          slug: projectId,
        }
      );

      if (data?.data) {
        const { projectSlug } = data.data;
        setProjectId(projectSlug);
        setDeployedURL(data.data.url);

        console.log(`Subscribing to logs:${projectSlug}`);
        socket.emit("subscribe", `logs:${projectSlug}`);
      }
    } catch (error) {
      console.error("Error deploying project:", error);
      toast.error("Error deploying project.");
      setLoading(false);
    }
  }, [projectId, repoURL]);

  const handleSocketIncomingMessage = useCallback((message: string) => {
    toast.dismiss();
    toast.loading("Building...");
    console.log(`[Incoming Socket Message]:`, message);
    try {
      const parsedMessage: LogMessage = JSON.parse(message);
      console.log(`[Parsed Message]:`, parsedMessage);

      // Add log to the state
      setLogs((prev) => [...prev, parsedMessage.log]);
      logContainerRef.current?.scrollIntoView({ behavior: "smooth" });

      // Check if the deployment is complete
      console.log(parsedMessage.complete);
      if (parsedMessage.complete) {
        console.log(parsedMessage.complete);
        toast.dismiss();
        setShowDeployedURL(true);

        toast.success("Project deployed successfully!");

        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing log message:", error);
    }
  }, []);

  useEffect(() => {
    if (!projectId) return;

    socket.on("message", handleSocketIncomingMessage);

    return () => {
      socket.off("message", handleSocketIncomingMessage);
    };
  }, [projectId, handleSocketIncomingMessage]);

  return (
    <main className="flex flex-col justify-center items-center py-12">
      <Toaster />
      <div className="w-1/2">
        <h1 className="text-6xl font-semibold py-8">Rooster</h1>
        <p className="text-lg text-neutral-300 pb-4">
          Deploy your{" "}
          <span className="bg-neutral-700 text-neutral-200 py-1 mx-1 px-2 rounded-lg">
            React
          </span>{" "}
          App on just a click of a button
        </p>
        <p className="text-md text-neutral-300 pb-4">
          Useful for quick production testing | In House Testing
        </p>

        <div className="flex flex-col items-center gap-4 my-2">
          <input
            className="rounded-lg p-2 w-full bg-white border border-neutral-300 text-black focus:outline-none"
            disabled={loading}
            value={repoURL}
            onChange={(e) => setURL(e.target.value)}
            type="url"
            placeholder="GitHub URL"
          />
        </div>
        <button
          onClick={handleClickDeploy}
          disabled={!isValidURL || loading}
          className={`w-full mt-3 p-2 cursor-pointer rounded-lg transition-all duration-200 hover:text-black ${
            loading
              ? "bg-neutral-200 dark:bg-neutral-700"
              : "hover:bg-neutral-100   dark:bg-neutral-800"
          } border border-neutral-300 dark:border-neutral-700`}
        >
          {loading ? "In Progress" : "Deploy"}
        </button>
        {logs.length > 0 && (
          <div className="text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-72 overflow-y-auto">
            <pre className="flex flex-col gap-1">
              {logs.map((log, i) => (
                <code
                  ref={logs.length - 1 === i ? logContainerRef : undefined}
                  key={i}
                >{`> ${log}`}</code>
              ))}
            </pre>
          </div>
        )}
        {showDeployedURL && (
          <div className="py-4 px-2 rounded-lg font-semibold text-2xl">
            <p>
              Deployed URL:{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline"
                href={deployedURL}
              >
                <div className="flex space-x-2">
                  <h1>{deployedURL}</h1>
                  <MdArrowOutward size={32} />
                </div>
                
              </a>
            </p>
          </div>
        )}
        <p className="text-lg py-4">
          <span className="font-bold">Tech Stack:</span> Next.js, Kubernetes,
          Docker, AWS- ECS, ECR, S3, Node.js, Redis
        </p>
        <a
          rel="noopener"
          target="_blank"
          href="https://github.com/psidh/Vinyasa"
          className="text-blue-500 text-xl font-bold"
        >
          <div className="flex items-end space-x-2">
            <FiGithub size={24} />
            <p>Github</p>
            <MdArrowOutward size={24} />
          </div>
        </a>
      </div>
    </main>
  );
}
