using System.Collections.Generic;

namespace HomelandSecurityService
{
    public class BackgroundTaskQueue : IBackgroundTaskQueue
    {
        private readonly Queue<string> _queue;

        public BackgroundTaskQueue()
            => _queue = new Queue<string>();

        public void QueuePassport(string passportNumber)
            => _queue.Enqueue(passportNumber);

        public bool TryDequeuePassport(out string passportNumber)
            => _queue.TryDequeue(out passportNumber);
    }
}
