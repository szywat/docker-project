"use client";

import { useState, useEffect, FormEvent } from "react";
import { Tasks } from "./types/tasks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const postTasks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        throw new Error("Nie udało się dodać zadania");
      }

      const newTask: Tasks = await res.json();
      setTasks((prevTasks) => [...prevTasks, newTask]);

      setTitle("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas dodawania zadania");
    }
  };

  const deleteTask = async (id: number | string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Nie udało się usunąć zadania");
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      setError("");
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas usuwania");
    }
  };

  const completeTask = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Nie udało się zaktualizować zadania");
      }

      const updatedTask: Tasks = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task)),
      );

      setError("");
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas aktualizacji");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Podaj tytuł zadania");
      return;
    }
    setError("");
    await postTasks();
  };

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        if (!res.ok) {
          throw new Error("Nie udało się pobrać zadań");
        }
        const data: Tasks[] = await res.json();
        setTasks(data);
        setError("");
      } catch (err: any) {
        setError(err.message || "Wystąpił błąd podczas pobierania");
      }
    };
    getTasks();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-blue-400 font-sans">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between gap-6 py-20 px-6 sm:px-10">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wpisz nazwę zadania..."
            className="flex-1 rounded-lg border border-foreground/20 bg-sky-200 px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-all"
          />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-3 font-medium text-background transition-colors hover:opacity-90"
          >
            Dodaj
          </button>
        </form>

        {error ? (
          <div className="w-full rounded-lg bg-red-100 px-4 py-3 text-red-800 shadow-sm">
            {error}
          </div>
        ) : null}

        {tasks.length > 0 ? (
          <table className="w-full rounded-lg border border-slate-300 bg-white text-left shadow-sm">
            <thead className="bg-sky-200 text-sm uppercase tracking-wide text-slate-700">
              <tr>
                <th className="px-4 py-3 w-16">ID</th>
                <th className="px-4 py-3 w-full">Nazwa</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="text-background">
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-500">{t.id}</td>
                  <td
                    className={`px-4 py-3 transition-all duration-300 ${
                      t.done ? "text-slate-400 line-through" : "text-slate-800"
                    }`}
                  >
                    {t.title}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => completeTask(t.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:opacity-90 ${
                          t.done
                            ? "bg-green-500 text-white"
                            : "bg-foreground text-background"
                        }`}
                        title={t.done ? "Cofnij ukończenie" : "Zakończ zadanie"}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>

                      <button
                        onClick={() => deleteTask(t.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                        title="Usuń zadanie"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="w-full rounded-lg bg-white px-4 py-6 text-slate-700 shadow-sm">
            Brak elementów do pokazania
          </div>
        )}
      </main>
    </div>
  );
}
