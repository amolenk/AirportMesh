namespace HomelandSecurityService
{
    public interface IBackgroundTaskQueue
    {
        void QueuePassport(string passportNumber);

        bool TryDequeuePassport(out string passportNumber);
    }
}
