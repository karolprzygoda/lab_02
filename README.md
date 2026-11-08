# System powiadomień — laboratorium 2

Projekt umożliwia planowanie i symulowanie doręczeń powiadomień e-mail oraz push. Doręczenie jest zapisywane w bazie danych — aplikacja nie wysyła prawdziwych wiadomości.

## Realizacja wymagań

1. **Tworzenie powiadomień.** Użytkownik podaje treść, odbiorcę, kanał e-mail lub push, strefę czasową oraz priorytet niski lub wysoki. Dla e-maila odbiorcą jest adres pocztowy, a dla push identyfikator użytkownika.

2. **Planowanie wysyłki.** Formularz pozwala wybrać przyszłą datę i godzinę w strefie odbiorcy. System przelicza termin na jednoznaczny moment i zapisuje go w PostgreSQL przez Prisma.

3. **Niezależne kanały.** E-mail i push obsługują osobne procesy workerów, niezależne od serwera strony. W Dockerze każdy działa w osobnym kontenerze. Worker pobiera wyłącznie wiadomości swojego kanału, więc zatrzymanie jednego nie zatrzymuje drugiego.

4. **Ochrona przed duplikatami i ponowienia.** Blokada rekordu uniemożliwia równoczesną obsługę tej samej wiadomości przez kilka workerów. Zapis doręczenia, historii próby i statusu odbywa się w jednej transakcji; błąd wycofuje całość. Unikalny identyfikator doręczenia zapobiega duplikatom, a identyfikator zgłoszenia chroni przed ponownym zapisaniem tego samego formularza. Dla symulowanych awarii przewidziano maksymalnie trzy próby łącznie, z odstępami 10 i 20 sekund. Po trzeciej nieudanej próbie wiadomość pozostaje ze statusem błędu — nie jest uznawana za doręczoną.

5. **Trwałe przechowywanie.** Powiadomienia oczekują w bazie, a nie w pamięci serwera. Restart aplikacji lub zatrzymanie workerów nie usuwa kolejki. Historia pozostaje dostępna również po obsłużeniu wiadomości.

6. **Wysyłka niezależna od tworzenia.** Formularz zapisuje zadanie, a worker później pobiera je z kolejki, gdy nadejdzie termin. Obciążenie może opóźnić obsługę, ale oczekujące zadania pozostają zapisane. Blokady `FOR UPDATE SKIP LOCKED` pozwalają równoległym workerom obsługiwać różne zadania bez wzajemnego oczekiwania na zajęte rekordy.

7. **Priorytety.** Spośród wiadomości gotowych do wysyłki worker najpierw wybiera wysoki priorytet. Następnie uwzględnia termin dostępności i kolejność utworzenia.

8. **Wymuszenie i anulowanie.** „Wyślij teraz” udostępnia oczekującą wiadomość workerowi natychmiast, pomijając zaplanowany termin i ciszę nocną. Nie zeruje liczby prób. „Anuluj wysyłkę” wyklucza oczekującą wiadomość z dalszej obsługi.

9. **Strefy czasowe i cisza nocna.** Wysyłka jest dozwolona od 08:00 do 22:00 czasu odbiorcy. Terminy nocne przesuwane są na najbliższą 08:00. Reguła jest sprawdzana także po przestoju i podczas ponowień. Nieistniejące lub niejednoznaczne godziny przy zmianie czasu są odrzucane.
